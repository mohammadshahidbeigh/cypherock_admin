import { useState, useEffect } from 'react';
import { db, checkAuth } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<string | null>(null);

  useEffect(() => {
    // On mount, check auth
    const token = localStorage.getItem('jwt_token');
    if (token) {
      checkAuth(token).then(res => {
        if (!res.valid) {
          localStorage.removeItem('jwt_token');
          onLogout();
        }
      });
    } else {
      onLogout();
    }
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'provisioned_devices'));
        const devicesArr = querySnapshot.docs.map(doc => doc.data());
        setDevices(devicesArr);
      } catch (err: any) {
        setError('Failed to fetch provisioned devices.');
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 style={{ color: '#003cff' }}>Admin & Auditing Dashboard</h1>
      <button className="logout-btn" onClick={onLogout}>Logout</button>
      <div className="dashboard-content">
        <div className="status-card" style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 className="title" style={{ fontSize: '1.3rem', marginBottom: 16 }}>Provisioned Devices</h2>
          {loading && <div className="status-message info">Loading...</div>}
          {error && <div className="status-message error">{error}</div>}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Operator</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Signed Certificate</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(devices) && devices.length > 0 ? (
                  devices.map((d, i) => (
                    <tr key={i}>
                      <td>{d.deviceId || d.deviceInfo?.deviceId || '-'}</td>
                      <td>{d.operator || d.deviceInfo?.operator || '-'}</td>
                      <td>{d.timestamp || d.createdAt || '-'}</td>
                      <td>{d.action || '-'}</td>
                      <td>{d.status || '-'}</td>
                      <td style={{ maxWidth: 220, wordBreak: 'break-all', fontSize: '0.95em', color: '#003cff', verticalAlign: 'middle', textAlign: 'center' }}>
                        {d.signedCertificate ? (
                          <>
                            <div style={{ wordBreak: 'break-all', marginBottom: 6 }}>
                              {d.signedCertificate.slice(0, 32)}{d.signedCertificate.length > 32 ? '...' : ''}
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button
                                style={{ padding: '4px 14px', fontSize: '0.97em', borderRadius: 5, border: '1px solid #b3c6ff', background: '#fff', color: '#003cff', cursor: 'pointer', boxShadow: '0 1px 4px #b3c6ff33' }}
                                onClick={() => {
                                  const blob = new Blob([d.signedCertificate], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${d.deviceId || 'certificate'}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  setTimeout(() => {
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  }, 0);
                                }}
                                title="Download Certificate"
                              >
                                Download
                              </button>
                              <button
                                style={{ padding: '4px 14px', fontSize: '0.97em', borderRadius: 5, border: '1px solid #b3c6ff', background: '#f4f8ff', color: '#003cff', cursor: 'pointer', boxShadow: '0 1px 4px #b3c6ff33' }}
                                onClick={() => setPreviewCert(d.signedCertificate)}
                                title="Preview Certificate"
                              >
                                Preview
                              </button>
                            </div>
                          </>
                        ) : '-' }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>
                      No devices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal for certificate preview */}
      {previewCert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.32)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: '2rem 2.5rem', maxWidth: 600, width: '90%', boxShadow: '0 4px 32px #003cff22', position: 'relative' }}>
            <h3 style={{ color: '#003cff', marginBottom: 16 }}>Signed Certificate Preview</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '1.05em', color: '#222', background: '#f4f8ff', padding: '1rem', borderRadius: 6, maxHeight: 350, overflowY: 'auto' }}>{previewCert}</pre>
            <button
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#003cff', fontSize: '1.2em', cursor: 'pointer' }}
              onClick={() => setPreviewCert(null)}
              title="Close Preview"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 