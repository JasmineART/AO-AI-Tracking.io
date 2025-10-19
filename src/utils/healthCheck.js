/**
 * System Health Check Utility
 * Performs comprehensive system diagnostics
 */

import { auth } from '../firebase';
import { realtimeDb as database } from '../firebase';
import errorMonitor from './errorMonitoring';

class HealthCheck {
  constructor() {
    this.checks = {
      firebase: { status: 'unknown', message: '' },
      database: { status: 'unknown', message: '' },
      authentication: { status: 'unknown', message: '' },
      localStorage: { status: 'unknown', message: '' },
      performance: { status: 'unknown', message: '' },
      errors: { status: 'unknown', message: '' }
    };
    this.lastCheck = null;
  }

  async runFullCheck() {
    console.log('🔍 Running full system health check...');
    const startTime = Date.now();

    try {
      await Promise.all([
        this.checkFirebase(),
        this.checkDatabase(),
        this.checkAuthentication(),
        this.checkLocalStorage(),
        this.checkPerformance(),
        this.checkErrors()
      ]);

      const duration = Date.now() - startTime;
      this.lastCheck = new Date().toISOString();

      console.log(`✅ Health check completed in ${duration}ms`);
      return this.getReport();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      errorMonitor.logError({
        type: 'Health Check Error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async checkFirebase() {
    try {
      if (!auth || !database) {
        throw new Error('Firebase not initialized');
      }
      this.checks.firebase = {
        status: 'healthy',
        message: 'Firebase SDK initialized',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.checks.firebase = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async checkDatabase() {
    try {
      // Test database connection
      const testRef = database.ref('.info/connected');
      const snapshot = await testRef.once('value');
      
      if (snapshot.val() === true) {
        this.checks.database = {
          status: 'healthy',
          message: 'Database connected',
          timestamp: new Date().toISOString()
        };
      } else {
        this.checks.database = {
          status: 'warning',
          message: 'Database connection unstable',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      this.checks.database = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async checkAuthentication() {
    try {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        this.checks.authentication = {
          status: 'healthy',
          message: `User authenticated: ${currentUser.email}`,
          timestamp: new Date().toISOString()
        };
      } else {
        this.checks.authentication = {
          status: 'info',
          message: 'No user authenticated',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      this.checks.authentication = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  checkLocalStorage() {
    try {
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (value === 'test') {
        this.checks.localStorage = {
          status: 'healthy',
          message: 'LocalStorage working',
          usage: this.getLocalStorageSize(),
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('LocalStorage read/write failed');
      }
    } catch (error) {
      this.checks.localStorage = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  checkPerformance() {
    try {
      const memory = performance.memory;
      const navigation = performance.navigation;
      
      const metrics = {
        jsHeapSize: memory ? Math.round(memory.usedJSHeapSize / 1048576) : 'N/A',
        jsHeapLimit: memory ? Math.round(memory.jsHeapSizeLimit / 1048576) : 'N/A',
        loadType: navigation ? navigation.type : 'N/A'
      };

      // Check if memory usage is concerning
      if (memory && (memory.usedJSHeapSize / memory.jsHeapSizeLimit) > 0.9) {
        this.checks.performance = {
          status: 'warning',
          message: 'High memory usage detected',
          metrics,
          timestamp: new Date().toISOString()
        };
      } else {
        this.checks.performance = {
          status: 'healthy',
          message: 'Performance normal',
          metrics,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      this.checks.performance = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  checkErrors() {
    try {
      const errorStats = errorMonitor.getErrorStats();
      
      if (errorStats.total === 0) {
        this.checks.errors = {
          status: 'healthy',
          message: 'No errors logged',
          stats: errorStats,
          timestamp: new Date().toISOString()
        };
      } else if (errorStats.total < 5) {
        this.checks.errors = {
          status: 'warning',
          message: `${errorStats.total} errors logged`,
          stats: errorStats,
          timestamp: new Date().toISOString()
        };
      } else {
        this.checks.errors = {
          status: 'error',
          message: `${errorStats.total} errors logged - investigation needed`,
          stats: errorStats,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      this.checks.errors = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return `${(total / 1024).toFixed(2)} KB`;
  }

  getReport() {
    const healthy = Object.values(this.checks).filter(c => c.status === 'healthy').length;
    const warning = Object.values(this.checks).filter(c => c.status === 'warning').length;
    const error = Object.values(this.checks).filter(c => c.status === 'error').length;
    const total = Object.keys(this.checks).length;

    return {
      summary: {
        overall: error > 0 ? 'error' : warning > 0 ? 'warning' : 'healthy',
        healthy,
        warning,
        error,
        total,
        percentage: Math.round((healthy / total) * 100)
      },
      checks: this.checks,
      lastCheck: this.lastCheck,
      timestamp: new Date().toISOString()
    };
  }

  getQuickStatus() {
    const report = this.getReport();
    return {
      status: report.summary.overall,
      score: report.summary.percentage,
      issues: report.summary.error + report.summary.warning
    };
  }
}

// Singleton instance
const healthCheck = new HealthCheck();

export default healthCheck;
