import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, MapPin, Cpu, CheckCircle2, Shield, Clock,
  ArrowRight, Users, Bell, AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="brand">Step-by-Step Guide</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
          How Kaiser AI Resolves Civic Issues
        </h1>
        <p className="text-base text-neutral-600">
          Our intelligent civic pipeline connects citizen reports directly to municipal ward engineers with zero bureaucratic loss.
        </p>
      </div>

      {/* Stepper Details */}
      <div className="space-y-12">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 bg-brand-50 rounded-3xl p-8 border border-brand-100 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-soft-sm text-brand-600 flex items-center justify-center">
              <Camera size={32} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Step 1: Capture & Pin</span>
            <h3 className="text-xl font-bold text-neutral-900">Citizen Submission</h3>
          </div>
          <div className="md:col-span-7 space-y-3">
            <h3 className="text-2xl font-bold text-neutral-900">Pinpoint with Sub-Meter GPS Precision</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              When reporting a pothole, open manhole, or garbage pile, citizens snap a photo or record a voice note. Kaiser AI captures exact GPS coordinates on OpenStreetMap and auto-detects your Mumbai municipal ward (e.g. K/E Ward, Andheri East).
            </p>
            <ul className="text-xs text-neutral-500 space-y-1.5 list-disc pl-4">
              <li>High-resolution photo upload with client-side compression</li>
              <li>Draggable map pin to fine-tune exact street spot</li>
              <li>Voice note support in English, Marathi, and Hindi</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-3 order-2 md:order-1">
            <h3 className="text-2xl font-bold text-neutral-900">Computer Vision & Severity Scoring</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Kaiser AI evaluates the image using custom neural networks trained on Mumbai infrastructure data. The system scores severity (1 to 100) taking into account depth, monsoon flood risk, and nearby pedestrian traffic.
            </p>
            <ul className="text-xs text-neutral-500 space-y-1.5 list-disc pl-4">
              <li>Category detection with 90%+ confidence</li>
              <li>Dynamic SLA calculated: Critical issues allocated 24h response window</li>
              <li>Automatic grouping of duplicate reports to pool community upvotes</li>
            </ul>
          </div>
          <div className="md:col-span-5 bg-accent-50 rounded-3xl p-8 border border-accent-100 flex flex-col items-center justify-center text-center space-y-3 order-1 md:order-2">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-soft-sm text-accent-600 flex items-center justify-center">
              <Cpu size={32} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">Step 2: AI Pipeline</span>
            <h3 className="text-xl font-bold text-neutral-900">Automated Triage</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 bg-sky-50 rounded-3xl p-8 border border-sky-100 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-soft-sm text-sky-600 flex items-center justify-center">
              <Shield size={32} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Step 3: Ward Routing</span>
            <h3 className="text-xl font-bold text-neutral-900">Officer Assignment</h3>
          </div>
          <div className="md:col-span-7 space-y-3">
            <h3 className="text-2xl font-bold text-neutral-900">Direct Delivery to Ward Engineers</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              The ticket is dispatched immediately to the designated Junior Engineer (Roads, Drainage, or Solid Waste Management) for that specific ward. Officers receive notifications directly on their portal with exact navigation directions.
            </p>
            <ul className="text-xs text-neutral-500 space-y-1.5 list-disc pl-4">
              <li>Strict SLA countdown timer visible to both citizen and officer</li>
              <li>Contractor work crew dispatch logging</li>
              <li>Citizen gets notified as soon as an officer accepts the assignment</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-3 order-2 md:order-1">
            <h3 className="text-2xl font-bold text-neutral-900">Photo-Verified Closing & Citizen Feedback</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              An issue cannot be marked 'Resolved' without an after-repair photo. The citizen receives an instant notification with the resolution image and can rate the quality of the repair.
            </p>
            <ul className="text-xs text-neutral-500 space-y-1.5 list-disc pl-4">
              <li>Mandatory resolution photo upload by ward engineer</li>
              <li>Citizen satisfaction rating feeds into monthly officer leaderboard</li>
              <li>Full audit trail stored for BMC municipal oversight</li>
            </ul>
          </div>
          <div className="md:col-span-5 bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col items-center justify-center text-center space-y-3 order-1 md:order-2">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-soft-sm text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 4: Completion</span>
            <h3 className="text-xl font-bold text-neutral-900">Resolution Verified</h3>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-brand-600 text-white rounded-3xl p-8 text-center space-y-4 shadow-brand">
        <h2 className="text-2xl font-bold">Have an issue you want to report right now?</h2>
        <p className="text-sm text-brand-100 max-w-lg mx-auto">
          It takes less than 60 seconds to submit a grievance and notify your local ward office.
        </p>
        <Link to="/app/report" className="inline-block">
          <button className="px-8 py-3 rounded-full font-bold text-sm bg-white text-brand-800 hover:bg-neutral-50 shadow-soft-sm cursor-pointer">
            Report Civic Issue
          </button>
        </Link>
      </div>
    </div>
  );
};
