import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div data-testid="project-card" onClick={() => navigate(`/project/${project.id}`)} className="group bg-white rounded-2xl shadow-lg p-4 cursor-pointer">
      <h3 className="text-lg font-bold">{project.name}</h3>
      <p className="text-sm text-gray-500">{project.type}</p>
    </div>
  );
};

export default ProjectCard;
