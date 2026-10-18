import React from 'react';
import { Award, Printer, X, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

export const MunicipalCertificateModal = ({ isOpen, onClose, certData }) => {
  if (!isOpen) return null;

  const data = certData || {
    certificateId: 'BMC-CIVIC-2026-PN8842',
    citizenName: 'Priya Nair',
    wardName: 'G/N Ward – Bandra (North)',
    civicKarma: 840,
    issuesResolved: 14,
    issueDate: 'October 2026',
    authorizedBy: 'Rajendra Mehta, IAS',
    designation: 'Municipal Commissioner, Greater Mumbai',
    verificationHash: 'A8F9-2026-C4B1-MCGM',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = `https://kaiser.mcgm.gov.in/verify-certificate/${data.certificateId}`;
    navigator.clipboard.writeText(url);
    toast.success('Certificate verification link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        
        {/* Header Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <span className="font-bold text-sm tracking-wide">Official Municipal Civic Honors</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} icon={Share2} className="text-white border-neutral-700 hover:bg-neutral-800 text-xs py-1">
              Share Link
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} icon={Printer} className="text-xs py-1">
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Parchment Body */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 relative print:p-8">
          {/* Guilloche Border */}
          <div className="border-4 border-double border-amber-600/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden bg-white/80 shadow-soft-lg">
            
            {/* Background Municipal Crest Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="text-[180px] font-black tracking-widest text-neutral-900">MCGM</span>
            </div>

            {/* Top Seal & Heading */}
            <div className="text-center space-y-3 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-soft-md mx-auto">
                <ShieldCheck size={36} />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-800">
                  Brihanmumbai Mahanagarpalika • MCGM
                </h3>
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Municipal Corporation of Greater Mumbai
                </h4>
              </div>

              <div className="pt-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-serif">
                  Certificate of Civic Recognition
                </h1>
                <p className="text-xs sm:text-sm text-amber-900/80 font-medium mt-1">
                  Presented under the Greater Mumbai Citizen Vigilance & Smart Governance Act
                </p>
              </div>
            </div>

            {/* Citation */}
            <div className="text-center my-8 space-y-3 relative z-10">
              <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400">
                This is proudly conferred upon
              </p>
              <div className="text-2xl sm:text-3xl font-black text-brand-900 border-b-2 border-brand-200 pb-2 max-w-md mx-auto font-serif">
                {data.citizenName}
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed pt-2">
                In formal recognition of exemplary civic responsibility, proactive vigilance, and vital partnership with ward engineering squads to triage, report, and expedite the resolution of municipal infrastructure hazards across <strong>{data.wardName}</strong>.
              </p>
            </div>

            {/* Verified Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto my-6 p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-center relative z-10">
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400">Grievances Resolved</span>
                <span className="text-lg font-black text-neutral-900">{data.issuesResolved}</span>
              </div>
              <div className="border-x border-amber-200/60">
                <span className="block text-[10px] uppercase font-bold text-neutral-400">Civic Karma</span>
                <span className="text-lg font-black text-brand-700">{data.civicKarma} pts</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400">Jurisdiction</span>
                <span className="text-xs font-black text-neutral-800 mt-1 block truncate">Ward 8 (G/N)</span>
              </div>
            </div>

            {/* Signatures & Official Municipal Stamp */}
            <div className="pt-8 border-t border-amber-200/60 flex items-end justify-between relative z-10 text-left">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Conferred On</span>
                <span className="text-xs font-semibold text-neutral-800">{data.issueDate}</span>
                <div className="text-[9px] text-neutral-400 font-mono mt-1">
                  Serial: <span className="font-bold text-brand-700">{data.certificateId}</span>
                </div>
              </div>

              {/* Official Gold Embossed Stamp */}
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-500 bg-amber-100/50 flex flex-col items-center justify-center text-amber-800 text-[8px] font-bold uppercase tracking-tighter p-1 text-center shadow-inner">
                <span>★ MCGM ★</span>
                <span className="text-[7px]">OFFICIAL SEAL</span>
                <span className="text-[6px]">MUMBAI</span>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-base sm:text-lg font-bold text-neutral-800 border-b border-neutral-300 pb-1">
                  {data.authorizedBy}
                </div>
                <span className="text-[11px] font-bold text-neutral-900 block mt-0.5">
                  {data.authorizedBy}
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  {data.designation}
                </span>
              </div>
            </div>

            {/* Cryptographic Hash Bar */}
            <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-400 font-mono">
              <span>MCGM DIGITAL INTEGRITY SEAL: {data.verificationHash}</span>
              <span>kaiser.mcgm.gov.in/verify</span>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 print:hidden">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Digitally certified & tamper-proof under Maharashtra Civic IT Standards.
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs py-1">
            Close
          </Button>
        </div>

      </div>
    </div>
  );
};
