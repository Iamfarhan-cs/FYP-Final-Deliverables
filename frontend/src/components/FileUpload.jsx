import { useState, useRef } from 'react';
import { uploadDataset } from '../api';
import Icon from './Icon';

export default function FileUpload({ onUploaded }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'txt'].includes(ext)) {
      setStatus('error:Only CSV or TXT files are supported');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setStatus('');
    try {
      const data = await uploadDataset(file);
      setStatus(`success:${data.count} tasks uploaded successfully`);
      onUploaded(data.count);
    } catch (err) {
      setStatus(`error:${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const statusType = status.split(':')[0];
  const statusMsg = status.split(':').slice(1).join(':');

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Upload Dataset</h2>
        {fileName && !loading && (
          <span className="tag tag-neutral">{fileName}</span>
        )}
      </div>
      <div className="panel-body">
        <div
          className={`dropzone ${dragActive ? 'dropzone-active' : ''} ${loading ? 'dropzone-disabled' : ''}`}
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt"
            onChange={(e) => processFile(e.target.files[0])}
            disabled={loading}
            hidden
          />
          {loading ? (
            <div className="dropzone-content">
              <span className="spinner spinner-lg" />
              <p>Processing dataset...</p>
            </div>
          ) : (
            <div className="dropzone-content">
              <span className="dropzone-icon"><Icon name="upload" size={32} /></span>
              <p><strong>Click to upload</strong> or drag & drop</p>
              <p className="text-muted-sm">CSV or TXT files • 100–1000 tasks</p>
            </div>
          )}
        </div>
        {status && (
          <div className={`alert ${statusType === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{statusType === 'error' ? '✕' : '✓'}</span>
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
