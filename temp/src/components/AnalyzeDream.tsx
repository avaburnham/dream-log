import React, { useEffect, useState } from 'react';

interface Dream {
  id: number;
  text: string;
  createdAt: string;
}

interface AnalyzeDreamProps {
  refresh: boolean;
}

const AnalyzeDream: React.FC<AnalyzeDreamProps> = ({ refresh }) => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch dreams when component mounts or refresh toggles
  useEffect(() => {
    setAnalysis('');
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please log in.');
      setDreams([]);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/dreams`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load dreams.');
        }
        return res.json();
      })
      .then(data => setDreams(data.reverse()))
      .catch(err => setError((err as Error).message));
  }, [refresh]);

  const selectedDream = dreams.find(d => d.id === selectedId);

  const handleAnalyze = async () => {
    setError('');
    setAnalysis('');
    if (!selectedDream) {
      setError('Please select a dream to analyze.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/analyze-hf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedDream.text }),
      });
      const result = await res.json();
      if (result.labels && result.scores) {
        setAnalysis(
          `Most likely feeling: ${result.labels[0]} (score: ${result.scores[0].toFixed(2)})\n\nAll labels:\n` +
            result.labels
              .map(
                (label: string, idx: number) =>
                  `${label}: ${result.scores[idx].toFixed(2)}`
              )
              .join('\n')
        );
      } else if (result.error) {
        setError(result.error);
      } else {
        setError('No analysis received.');
      }
    } catch (err) {
      setError('Error analyzing dream.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="h5 mb-3">Analyze a Dream</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <select
          className="form-select"
          value={selectedId ?? ''}
          onChange={e => setSelectedId(Number(e.target.value))}
        >
          <option value="">Select a dream...</option>
          {dreams.map(dream => (
            <option key={dream.id} value={dream.id}>
              {new Date(dream.createdAt).toLocaleString()} - {dream.text.slice(0, 30)}...
            </option>
          ))}
        </select>
      </div>
      <button
        className="btn btn-info mb-3"
        onClick={handleAnalyze}
        disabled={!selectedDream || loading}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {analysis && (
        <pre className="alert alert-secondary mt-3" style={{ whiteSpace: 'pre-wrap' }}>
          <strong>AI Analysis:</strong>
          <br />
          {analysis}
        </pre>
      )}
    </div>
  );
};

export default AnalyzeDream;
