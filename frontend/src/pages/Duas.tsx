import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Repeat } from 'lucide-react';
import axios from 'axios';

interface Dua {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  repeat: number;
}

interface Category {
  id: string;
  title: string;
  duas: Dua[];
}

const Duas: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('morning');

  useEffect(() => {
    const fetchDuas = async () => {
      try {
        const res = await axios.get('/data/duas.json');
        setCategories(res.data.categories);
      } catch (err) {
        console.error("Failed to load Duas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDuas();
  }, []);

  const toggleCategory = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
  };

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto">
      <header className="mb-8 pt-8">
        <h1 className="text-3xl font-bold text-text mb-2">Hisnul Muslim</h1>
        <p className="text-subtext text-sm">Fortress of the Muslim (Daily Duas).</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-primary" />
                  <span className="font-bold text-text">{category.title}</span>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronUp size={20} className="text-muted" />
                ) : (
                  <ChevronDown size={20} className="text-muted" />
                )}
              </button>
              
              {expandedCategory === category.id && (
                <div className="p-4 space-y-6 bg-card border-t border-border">
                  {category.duas.map((dua, index) => (
                    <div key={dua.id} className={`${index !== category.duas.length - 1 ? 'border-b border-border pb-6' : ''}`}>
                      <div className="flex justify-end mb-4">
                        <span className="text-2xl font-arabic text-text leading-loose text-right" dir="rtl">
                          {dua.arabic}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary mb-2 italic">
                        {dua.transliteration}
                      </p>
                      <p className="text-sm text-subtext mb-3 leading-relaxed">
                        "{dua.translation}"
                      </p>
                      <div className="flex items-center justify-between mt-4 text-xs font-bold text-muted uppercase tracking-wider">
                        <span>{dua.reference}</span>
                        {dua.repeat > 1 && (
                          <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-md">
                            <Repeat size={12} />
                            <span>Repeat {dua.repeat}x</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Duas;
