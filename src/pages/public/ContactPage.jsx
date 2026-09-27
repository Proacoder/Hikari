import React, { useState } from 'react';
import { Phone, Mail, MapPin, Building2, Search, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MUMBAI_WARDS } from '../../utils/mockData';

export const ContactPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', ward: 'K/E Ward', message: '' });

  const filteredWards = MUMBAI_WARDS.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="brand">Municipal Helpdesk</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
          Contact Us & Ward Directory
        </h1>
        <p className="text-base text-neutral-600">
          Reach our municipal liaison team or locate your specific ward office contact across Greater Mumbai.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 shadow-soft-sm">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Send an Enquiry</h2>
              <p className="text-xs text-neutral-500">For general queries, partnership, or ALM onboarding.</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h3 className="font-bold text-neutral-900 text-base">Message Sent!</h3>
                <p className="text-xs text-neutral-600">Our liaison officer will contact you within 24 business hours.</p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Message / Query</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your inquiry or society concern..."
                    className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" fullWidth className="py-3">
                  Submit Message
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-brand-600 shrink-0" />
                <span>Central BMC Disaster Management: <strong>1916</strong> (24x7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-brand-600 shrink-0" />
                <span>Email: <strong>support@kaiserai.mcgm.gov.in</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-brand-600 shrink-0" />
                <span>Citizen Helpdesk: Mon–Sat, 8:00 AM – 8:00 PM</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 26 Ward Offices Searchable Directory */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">26 Municipal Ward Directory</h2>
              <p className="text-xs text-neutral-500">Locate your ward office phone line & assistant engineer.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
              <input
                type="text"
                placeholder="Search ward or locality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredWards.map((w) => (
              <Card key={w.id} hover className="p-4 space-y-2 border border-neutral-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">{w.name}</span>
                  <Badge variant="brand" size="sm">Zone #{w.id}</Badge>
                </div>
                <p className="text-xs text-neutral-600 font-medium">{w.area}</p>
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1"><Phone size={11} /> 022-2416-00{w.id < 10 ? '0' + w.id : w.id}</span>
                  <span className="text-brand-600 font-semibold">Active Office</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
