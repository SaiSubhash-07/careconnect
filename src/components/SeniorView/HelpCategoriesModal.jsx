import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { helpCategories } from '../../data/mockData';
import { X, HeartHandshake, CheckCircle2, Volume2, Send, Mic } from 'lucide-react';
import { speakText } from '../../utils/speech';

export const HelpCategoriesModal = () => {
  const {
    submitDailyHelpRequest,
    setActiveModal,
    highContrast,
    language,
    t
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState(helpCategories[0]);
  const [detailsNote, setDetailsNote] = useState('');

  const getCategoryTranslation = (catId) => {
    switch (catId) {
      case 'grocery':
        return { title: t('catGrocery'), desc: t('catGroceryDesc') };
      case 'medicine_pickup':
        return { title: t('catMedicine'), desc: t('catMedicineDesc') };
      case 'walking':
        return { title: t('catWalking'), desc: t('catWalkingDesc') };
      case 'hospital_visit':
        return { title: t('catHospital'), desc: t('catHospitalDesc') };
      case 'food':
        return { title: t('catFood'), desc: t('catFoodDesc') };
      case 'household':
        return { title: t('catHousehold'), desc: t('catHouseholdDesc') };
      case 'talk':
        return { title: t('catTalk'), desc: t('catTalkDesc') };
      default:
        return { title: catId, desc: '' };
    }
  };

  const handleSelect = (category) => {
    setSelectedCategory(category);
    const trans = getCategoryTranslation(category.id);
    speakText(`${trans.title}. ${trans.desc}. ${t('btnRequestHelp')}.`, language);
  };

  const handleSubmit = () => {
    const trans = getCategoryTranslation(selectedCategory.id);
    submitDailyHelpRequest({ ...selectedCategory, title: trans.title }, detailsNote);
  };

  const handleReadAloud = () => {
    speakText(
      `${t('needHelpModalTitle')}. ${t('selectServicePrompt')}. ${t('catGrocery')}, ${t('catMedicine')}, ${t('catWalking')}, ${t('catHospital')}, ${t('catFood')}, ${t('catHousehold')}, ${t('catTalk')}.`,
      language
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transition-all my-auto border-4 ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-emerald-500'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl">
              🤝
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t('needHelpModalTitle')}
              </h2>
              <p className="text-emerald-100 font-medium text-sm sm:text-base">
                {t('needHelpModalSub')}
              </p>
            </div>
          </div>

          <button
            onClick={handleReadAloud}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('readOptionsAloud')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 space-y-6">
          <p className="text-sm sm:text-base font-bold text-slate-600">
            {t('selectServicePrompt')}
          </p>

          {/* Grid of 7 Categories from Prompt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {helpCategories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const trans = getCategoryTranslation(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat)}
                  className={`p-4 rounded-2xl border-3 flex items-start gap-3.5 text-left transition-all active:scale-98 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-2xl flex items-center justify-center shrink-0 shadow-xs">
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-base sm:text-lg truncate">
                        {trans.title}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 line-clamp-2 mt-0.5">
                      {trans.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional Voice Note / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t('optionalNote')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={detailsNote}
                onChange={(e) => setDetailsNote(e.target.value)}
                placeholder={`e.g., Need help this afternoon...`}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button: [ REQUEST HELP ] */}
          <button
            onClick={handleSubmit}
            className="w-full py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition active:scale-98"
          >
            <HeartHandshake className="w-7 h-7" />
            <span>{t('btnRequestHelp')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
