import React, { useEffect, useState } from 'react';

interface Dream {
  id: number;
  text: string;
  createdAt: string;
}

interface DreamListProps {
  refresh: boolean;
}

const DreamList: React.FC<DreamListProps> = ({ refresh }) => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDreams = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Not authenticated. Please log in.');
        }
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/dreams`, // <-- FIXED: Use backticks here!
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch dreams');
        }
        const data = await response.json();
        setDreams(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDreams();
  }, [refresh]);

  if (loading) return <p>Loading dreams...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {dreams.length === 0 ? (
        <p>No dreams logged yet.</p>
      ) : (
        <ul>
          {dreams.map((dream) => (
            <li key={dream.id}>
              <strong>{new Date(dream.createdAt).toLocaleString()}:</strong> {dream.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DreamList;
