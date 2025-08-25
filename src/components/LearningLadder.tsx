import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Edit2, Trash2, Link, Paperclip } from 'lucide-react';
import { useGitHubData } from '../hooks/useGitHubData';
import type { LearningDay, Attachment, ExternalLink } from '../services/githubService';

export const LearningLadder: React.FC = () => {
  const { data, loading, syncing, error, saveData } = useGitHubData();
  const [editing, setEditing] = useState<number | null>(null);

  const addNewDay = () => {
    const newDay: LearningDay = {
      id: Date.now(),
      dayNumber: data.length + 1,
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      attachments: [],
      links: [],
      isExpanded: true,
    };

    saveData([...data, newDay]);
    setEditing(newDay.id);
  };

  const updateDay = (updatedDay: LearningDay) => {
    const newData = data.map(day => 
      day.id === updatedDay.id ? updatedDay : day
    );
    saveData(newData);
    setEditing(null);
  };

  const deleteDay = (id: number) => {
    if (window.confirm('Are you sure you want to delete this day?')) {
      const newData = data.filter(day => day.id !== id);
      saveData(newData);
    }
  };

  const toggleExpand = (id: number) => {
    const newData = data.map(day =>
      day.id === id ? { ...day, isExpanded: !day.isExpanded } : day
    );
    saveData(newData);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Ladder</h1>
          <button
            onClick={addNewDay}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            disabled={syncing}
          >
            <Plus size={20} />
            <span>Add Day</span>
          </button>
        </div>

        {syncing && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
            Syncing changes...
          </div>
        )}

        <div className="space-y-4">
          {data.map((day) => (
            <div
              key={day.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleExpand(day.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-primary">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-gray-500">{day.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(day.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDay(day.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  {day.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {day.isExpanded && (
                <div className="p-4 border-t border-gray-100">
                  {editing === day.id ? (
                    <DayEditor day={day} onSave={updateDay} onCancel={() => setEditing(null)} />
                  ) : (
                    <DayView day={day} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DayEditorProps {
  day: LearningDay;
  onSave: (day: LearningDay) => void;
  onCancel: () => void;
}

const DayEditor: React.FC<DayEditorProps> = ({ day, onSave, onCancel }) => {
  const [editedDay, setEditedDay] = useState<LearningDay>(day);

  const addAttachment = () => {
    const url = window.prompt('Enter attachment URL:');
    const title = window.prompt('Enter attachment title:');
    if (url && title) {
      const newAttachment: Attachment = {
        type: 'link',
        url,
        title,
      };
      setEditedDay({
        ...editedDay,
        attachments: [...editedDay.attachments, newAttachment],
      });
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter resource URL:');
    const title = window.prompt('Enter resource title:');
    if (url && title) {
      const newLink: ExternalLink = { url, title };
      setEditedDay({
        ...editedDay,
        links: [...editedDay.links, newLink],
      });
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editedDay.title}
        onChange={(e) => setEditedDay({ ...editedDay, title: e.target.value })}
        placeholder="What did you learn today?"
        className="w-full p-2 border rounded-lg"
      />
      <textarea
        value={editedDay.description}
        onChange={(e) => setEditedDay({ ...editedDay, description: e.target.value })}
        placeholder="Describe what you learned..."
        className="w-full p-2 border rounded-lg min-h-[100px]"
      />
      
      <div className="flex gap-2">
        <button
          onClick={addAttachment}
          className="flex items-center gap-2 px-3 py-1 border rounded-lg hover:bg-gray-50"
        >
          <Paperclip size={16} />
          <span>Add Attachment</span>
        </button>
        <button
          onClick={addLink}
          className="flex items-center gap-2 px-3 py-1 border rounded-lg hover:bg-gray-50"
        >
          <Link size={16} />
          <span>Add Resource</span>
        </button>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editedDay)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Save
        </button>
      </div>
    </div>
  );
};

interface DayViewProps {
  day: LearningDay;
}

const DayView: React.FC<DayViewProps> = ({ day }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{day.title}</h3>
      <p className="text-gray-700 whitespace-pre-wrap">{day.description}</p>

      {day.attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Attachments</h4>
          <div className="flex flex-wrap gap-2">
            {day.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Paperclip size={16} />
                <span>{attachment.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {day.links.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Resources</h4>
          <div className="flex flex-wrap gap-2">
            {day.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Link size={16} />
                <span>{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
