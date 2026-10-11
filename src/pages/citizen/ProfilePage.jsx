import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { MUMBAI_WARDS } from '../../utils/mockData';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || 'Priya Nair',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'priya.nair@example.com',
    ward: user?.ward || 8,
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Profile settings updated successfully!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Signed out safely.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Citizen Profile & Settings</h1>
        <p className="text-xs text-neutral-500">Manage personal contact info, ward assignment, and SMS alert preferences.</p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-bold text-xl flex items-center justify-center shadow-soft-sm">
            {user?.avatarInitials || 'PN'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{formData.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="brand">Registered Citizen</Badge>
              <span className="text-xs text-neutral-400">Ward #{formData.ward} Resident</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              disabled
              hint="Managed by BMC Municipal SSO"
            />
            <Input
              label="Mobile Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">Assigned Ward Zone</label>
            <select
              value={formData.ward}
              onChange={(e) => setFormData({ ...formData, ward: Number(e.target.value) })}
              className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-800"
            >
              {MUMBAI_WARDS.map((w) => (
                <option key={w.id} value={w.id}>{w.name} – {w.area}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Alert Preferences</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600">SMS Milestone Notifications on Repair Progress</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600">Monsoon Flooding & High AQI Ward Advisories</span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="rounded-full px-6">
              Save Changes
            </Button>
          </div>
        </form>

        <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-red-600">Sign Out of Portal</div>
            <div className="text-[11px] text-neutral-400">Safely terminate active session on this device.</div>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} icon={LogOut} className="rounded-full">
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
