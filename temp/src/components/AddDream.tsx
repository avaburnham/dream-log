import React, { useState, useEffect } from 'react';

interface AddDreamProps {
  refresh: boolean;
  onAdd: () => void;
}

const AddDream: React.FC<AddDreamProps> = ({ refresh, onAdd }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    setText('');
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to add a dream.');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/dreams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error('Failed to add dream');
      }

      setText('');
      onAdd();
    } catch (error) {
      console.error(error);
      alert('Error adding dream');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2 mb-4">
      <input
        type="text"
        className="form-control"
        placeholder="Enter your dream"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Add
      </button>
    </form>
  );
};

export default AddDream;
