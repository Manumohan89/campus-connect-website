// ViewProfile — redirect to the full Profile page
// This component exists for backwards compat; the Profile page is the canonical view
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ViewProfile() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/profile', { replace: true }); }, [navigate]);
  return null;
}
