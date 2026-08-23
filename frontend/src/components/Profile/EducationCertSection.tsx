import React, { useState } from 'react';
import { MasterProfile, Education, Certification } from '../../types/profile';
import { profileService } from '../../services/profile';
import { GraduationCap, Award, Plus, Trash2 } from 'lucide-react';

interface Props {
  profile: MasterProfile;
  onUpdate: (updated: MasterProfile) => void;
}

export const EducationCertSection: React.FC<Props> = ({ profile, onUpdate }) => {
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [showAddCert, setShowAddCert] = useState(false);

  const [newEdu, setNewEdu] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    gpa_or_honors: '',
  });

  const [newCert, setNewCert] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    credential_id: '',
    credential_url: '',
  });

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdu.institution || !newEdu.degree) return;

    try {
      await profileService.addEducation(newEdu);
      setNewEdu({
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        gpa_or_honors: '',
      });
      setShowAddEdu(false);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to add education:', err);
    }
  };

  const handleDeleteEducation = async (eduId: number) => {
    try {
      await profileService.deleteEducation(eduId);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to delete education:', err);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name || !newCert.issuing_organization) return;

    try {
      await profileService.addCertification(newCert);
      setNewCert({
        name: '',
        issuing_organization: '',
        issue_date: '',
        credential_id: '',
        credential_url: '',
      });
      setShowAddCert(false);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to add certification:', err);
    }
  };

  const handleDeleteCertification = async (certId: number) => {
    try {
      await profileService.deleteCertification(certId);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to delete certification:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Education Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-peach-400" />
            <span>Education</span>
          </h3>
          <button
            onClick={() => setShowAddEdu(!showAddEdu)}
            className="px-2.5 py-1 rounded bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {showAddEdu && (
          <form onSubmit={handleAddEducation} className="glass-panel p-4 space-y-3 text-xs border-peach-500/30">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Institution *</label>
              <input
                type="text"
                required
                value={newEdu.institution}
                onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                placeholder="University of California, Berkeley"
                className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Degree *</label>
                <input
                  type="text"
                  required
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                  placeholder="B.S. / M.S."
                  className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Field of Study</label>
                <input
                  type="text"
                  value={newEdu.field_of_study}
                  onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
                  placeholder="Computer Science"
                  className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddEdu(false)}
                className="px-2.5 py-1 rounded bg-dark-hover text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-peach-500 text-white font-semibold text-xs"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {profile.education.length === 0 ? (
          <p className="text-xs text-dark-muted italic">No education entries added.</p>
        ) : (
          <div className="space-y-3">
            {profile.education.map((edu) => (
              <div key={edu.id} className="glass-panel p-4 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{edu.institution}</h4>
                  <p className="text-xs text-peach-400 font-medium">
                    {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => edu.id && handleDeleteEducation(edu.id)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Certifications</span>
          </h3>
          <button
            onClick={() => setShowAddCert(!showAddCert)}
            className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-glow-cyan flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {showAddCert && (
          <form onSubmit={handleAddCertification} className="glass-panel p-4 space-y-3 text-xs border-emerald-500/30">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Certification Name *</label>
              <input
                type="text"
                required
                value={newCert.name}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                placeholder="AWS Certified Solutions Architect"
                className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Issuing Organization *</label>
              <input
                type="text"
                required
                value={newCert.issuing_organization}
                onChange={(e) => setNewCert({ ...newCert, issuing_organization: e.target.value })}
                placeholder="Amazon Web Services / Google Cloud"
                className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCert(false)}
                className="px-2.5 py-1 rounded bg-dark-hover text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-emerald-500 text-white font-semibold text-xs"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {profile.certifications.length === 0 ? (
          <p className="text-xs text-dark-muted italic">No certifications added.</p>
        ) : (
          <div className="space-y-3">
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="glass-panel p-4 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{cert.name}</h4>
                  <p className="text-xs text-emerald-400 font-medium">{cert.issuing_organization}</p>
                </div>
                <button
                  onClick={() => cert.id && handleDeleteCertification(cert.id)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
