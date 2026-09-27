import React from 'react';
import { Shield, Target, Users, Award, Building2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="brand">Our Mission</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
          About Kaiser AI
        </h1>
        <p className="text-base text-neutral-600">
          Empowering citizens and municipal authorities with artificial intelligence to build a cleaner, safer, and more resilient Mumbai.
        </p>
      </div>

      {/* Vision & Mission Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-4 border-l-4 border-l-brand-600 shadow-soft-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">The Problem</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            In a megacity of over 20 million residents spread across 26 municipal wards, civic grievances such as potholes, garbage accumulation, and drainage failures frequently get lost in traditional paper bureaucracy or clogged telephone helplines.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Citizens face lack of visibility into resolution timelines, while ward engineers struggle with prioritizing high-risk hazards from thousands of unranked complaints.
          </p>
        </Card>

        <Card className="p-8 space-y-4 border-l-4 border-l-emerald-600 shadow-soft-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Our Solution</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Kaiser AI bridges this gap with automated computer vision categorization, geospatial intelligence on OpenStreetMap, and algorithmic severity scoring taking monsoon conditions and citizen impact into account.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Every complaint is tracked through a public, verifiable lifecycle with photo proof of resolution, ensuring complete accountability for citizens and ward officers alike.
          </p>
        </Card>
      </div>

      {/* Team Context & Academic Project Credentials */}
      <div className="bg-neutral-50 rounded-3xl p-8 sm:p-12 border border-neutral-200/80 space-y-6">
        <div className="max-w-2xl space-y-2">
          <Badge variant="brand">Academic Engineering Capstone</Badge>
          <h3 className="text-2xl font-bold text-neutral-900">Designed for Municipal Scale</h3>
          <p className="text-xs text-neutral-500">
            Kaiser AI was conceived and developed as a final-year engineering initiative focused on Civic-Tech and Urban Infrastructure AI for Brihanmumbai Municipal Corporation (BMC).
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-4">
          <div className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-soft-sm space-y-1">
            <div className="text-lg font-bold text-neutral-900">26 Wards</div>
            <div className="text-xs text-neutral-500">Full administrative mapping from Colaba to Dahisar and Mulund.</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-soft-sm space-y-1">
            <div className="text-lg font-bold text-neutral-900">Open-Source Leaflet</div>
            <div className="text-xs text-neutral-500">Zero vendor lock-in mapping powered by OpenStreetMap.</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-soft-sm space-y-1">
            <div className="text-lg font-bold text-neutral-900">REST Contract</div>
            <div className="text-xs text-neutral-500">Decoupled enterprise architecture ready for smart city API integration.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
