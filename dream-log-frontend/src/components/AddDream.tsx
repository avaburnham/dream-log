import React, { useState, useEffect } from 'react';

interface AddDreamProps {
  refresh: boolean;
  onAdd: () => void;
}

const AddDream: React.FC<AddDreamProps> = ({ refresh, onAdd }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dreamAdded, setDreamAdded] = useState(false);

  useEffect(() => {
    setText('');
  }, [refresh]);

  // Hide the success message after 2 seconds
  useEffect(() => {
    if (dreamAdded) {
      const timer = setTimeout(() => setDreamAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [dreamAdded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to add a dream.');
        setLoading(false);
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
      setDreamAdded(true);
      onAdd();
    } catch (error) {
      console.error(error);
      alert('Error adding dream');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-2 mb-4" style={{ width: "100%" }}>
      <textarea
        placeholder="Enter your dream"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        style={{
          width: '100%',
          resize: 'vertical',
          border: 'none',
          outline: 'none',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          background: '#f5f5f5',
          fontSize: '1rem',
        }}
      />
      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading || !text.trim()}
        style={{ width: "fit-content", alignSelf: "flex-end" }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Adding...
          </>
        ) : (
          "Add Dream"
        )}
      </button>
      {dreamAdded && (
        <div className="alert alert-success mt-2 p-2" style={{ width: "fit-content", alignSelf: "flex-end" }}>
          Dream added!
        </div>
      )}
    </form>
  );
};

export default AddDream;
