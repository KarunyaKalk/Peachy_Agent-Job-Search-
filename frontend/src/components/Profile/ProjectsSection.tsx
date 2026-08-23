import React, { useState } from 'react';
import { MasterProfile, Project } from '../../types/profile';
import { profileService } from '../../services/profile';
import { FolderGit2, Plus, Trash2, ExternalLink, Code } from 'lucide-react';

interface Props {
  profile: MasterProfile;
  onUpdate: (updated: MasterProfile) => void;
}

export const ProjectsSection: React.FC<Props> = ({ profile, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    project_url: '',
    start_date: '',
    end_date: '',
  });

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;

    try {
      await profileService.addProject(newProject);
      setNewProject({
        title: '',
        description: '',
        technologies: '',
        project_url: '',
        start_date: '',
        end_date: '',
      });
      setShowAddForm(false);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to add project:', err);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await profileService.deleteProject(projectId);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-peach-400" />
            <span>Notable Projects & Contributions</span>
          </h3>
          <p className="text-xs text-dark-muted">
            Projects can be automatically referenced by Claude when matching specialized job requirements.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddProject} className="glass-panel p-5 space-y-3 border-peach-500/30 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider">New Project Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Peachy AI Job Agent / Microservice Framework"
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Technologies Used</label>
              <input
                type="text"
                value={newProject.technologies}
                onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                placeholder="React, FastAPI, PostgreSQL, Docker, Claude API"
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Project Link / Repo URL</label>
              <input
                type="url"
                value={newProject.project_url}
                onChange={(e) => setNewProject({ ...newProject, project_url: e.target.value })}
                placeholder="https://github.com/username/project"
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Built an autonomous job search agent that discovers roles, tailors resumes with zero hallucinations, and scores ATS compatibility..."
              className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded bg-dark-hover text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach"
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {profile.projects.length === 0 ? (
        <div className="glass-panel p-8 text-center text-xs text-dark-muted space-y-2">
          <p>No projects added yet.</p>
          <p className="text-slate-400">Click "Add Project" to highlight open source work or side projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.projects.map((proj) => (
            <div key={proj.id} className="glass-panel p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-white text-sm hover:text-peach-400 cursor-pointer">
                    {proj.title}
                  </h4>
                  <button
                    onClick={() => proj.id && handleDeleteProject(proj.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                )}

                {proj.technologies && (
                  <div className="flex items-center space-x-1.5 text-xs text-dark-muted">
                    <Code className="w-3.5 h-3.5 text-peach-400 shrink-0" />
                    <span className="font-mono text-[11px] text-peach-300 truncate">{proj.technologies}</span>
                  </div>
                )}
              </div>

              {proj.project_url && (
                <a
                  href={proj.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:underline pt-2 border-t border-dark-border/60"
                >
                  <span>View Project</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
