import React, { useEffect, useRef, useState } from 'react';

import { Squircle } from '../ultimate-squircle/squircle-js';

import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';

import styles from './EmojiPicker.module.css' 

type Emoji = {
  char: string;
  name: string;
  category: string;
};

type Props = {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

const RECENT_KEY = 'recent_emojis';
const MAX_RECENT = 24;

const getRecentEmojis = (): string[] => {
  const raw = localStorage.getItem(RECENT_KEY);
  return raw ? JSON.parse(raw) : [];
};

const addRecentEmoji = (emoji: string) => {
  const current = getRecentEmojis().filter(e => e !== emoji);
  const updated = [emoji, ...current].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

const fetchEmojiList = async (): Promise<Emoji[]> => {
  try {
    const res = await fetch('https://unpkg.com/emoji.json/emoji.json');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch {
    const fallback = await import('../../assets/emojis_fallback.json');
    return fallback.default;
  }
};







const EmojiPicker: React.FC<Props> = ({ visible, onSelect, onClose }) => {
    const [emojis, setEmojis] = useState<Emoji[]>([]);
    const [activeCategory, setActiveCategory] = useState('Recent');
    const pickerRef = useRef<HTMLDivElement>(null);
    const tabRef = useRef<HTMLDivElement>(null);
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const emojiGridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const tabContainer = tabRef.current;
      if (!tabContainer) return;

      let frameId: number;

      const scrollToActiveTab = () => {
        const activeTab = tabContainer.querySelector(`[data-category="${activeCategory}"]`) as HTMLButtonElement;
        if (!activeTab) return;

        const containerRect = tabContainer.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();

        const leftOverflow = tabRect.left < containerRect.left + 8;
        const rightOverflow = tabRect.right > containerRect.right - 8;

        if (leftOverflow) {
          tabContainer.scrollBy({
            left: tabRect.left - containerRect.left - 16,
            behavior: 'smooth',
          });
        } else if (rightOverflow) {
          tabContainer.scrollBy({
            left: tabRect.right - containerRect.right + 16,
            behavior: 'smooth',
          });
        }
      };

      frameId = requestAnimationFrame(scrollToActiveTab);

      return () => cancelAnimationFrame(frameId);
    }, [activeCategory]);


    useEffect(() => {
        const grid = emojiGridRef.current;
        if (!grid) return;

        const handleScroll = () => {
          const scrollTop = grid.scrollTop;
          const sorted = Object.entries(categoryRefs.current).sort(
            ([, a], [, b]) => (a?.offsetTop || 0) - (b?.offsetTop || 0)
          );
          
          for (const [cat, el] of sorted) {
            if (el && el.offsetTop - scrollTop <= 100) {
              if (cat !== activeCategory) {
                setActiveCategory(cat);
              }
            }
          }
        };

        grid.addEventListener('scroll', handleScroll);
        return () => grid.removeEventListener('scroll', handleScroll);
    }, [activeCategory]);

    const handleTabClick = (category: string) => {
      setActiveCategory(category);
      const section = categoryRefs.current[category];
      if (section && emojiGridRef.current) {
        emojiGridRef.current.scrollTo({
          top: section.offsetTop - 10,
          behavior: 'smooth'
        });
      }
    };

    useEffect(() => {
      const tabContainer = tabRef.current;
      if (!tabContainer) return;

      let isDragging = false;
      let startX = 0;
      let scrollLeft = 0;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        tabContainer.style.cursor = 'grabbing';
        startX = e.pageX - tabContainer.offsetLeft;
        scrollLeft = tabContainer.scrollLeft;
      };

      const onMouseUp = () => {
        isDragging = false;
        tabContainer.style.cursor = 'grab';
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - tabContainer.offsetLeft;
        const walk = (x - startX);
        tabContainer.scrollLeft = scrollLeft - walk;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        tabContainer.scrollLeft += e.deltaY;
      };

      tabContainer.style.cursor = 'grab';
      tabContainer.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('mousemove', onMouseMove);
      tabContainer.addEventListener('wheel', onWheel, { passive: false });

      return () => {
        tabContainer.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        tabContainer.removeEventListener('wheel', onWheel);
      };
    }, []);

    useEffect(() => {
      fetchEmojiList().then(setEmojis);
    }, []);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          onClose();
        }
      };
      if (visible) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [visible]);

     if (!visible) return null;

     const categories = ['Recent', ...Array.from(new Set(emojis.map(e => e.category)))];
     const displayedEmojis =
      activeCategory === 'Recent'
        ? getRecentEmojis().map(char => ({ char, name: '', category: 'Recent' }))
        : emojis.filter(e => e.category === activeCategory);

     return (
        <div ref={pickerRef}> 
        <Squircle 
            //cornerRadius={20}
            topLeftCornerRadius={20}//Левый верхний
            topRightCornerRadius={20}//Правый верхний
            bottomLeftCornerRadius={20}//Левый нижний
            bottomRightCornerRadius={20}//Правый нижний
            
            
            
            cornerSmoothing={1}
            defaultWidth={400}
            defaultHeight={320}
            className={styles.pickerContainer}
        >
      {/*<div ref={pickerRef} className={styles.pickerContainer}>*/}
        <div ref={tabRef}  className={styles.categoryTabs}>
          {categories.map(category => (
            <button
              key={category}
              data-category={category}
              onClick={() => handleTabClick(category) /*setActiveCategory(category)*/}
              className={`${styles.tabButton}`}
              style={{
                fontWeight: activeCategory === category ? 'bold' : 'normal',
              }}
            >
              {category}
            </button>
          ))}
        </div>
        {/*<CustomScrollbar>*/}
        <CustomScrollbar>
        <div ref={emojiGridRef} className={styles.emojiGrid}>
          {categories.map(category => {
            const emojisInCategory =
              category === 'Recent'
                ? getRecentEmojis().map(char => ({ char, name: '', category }))
                : emojis.filter(e => e.category === category);
        
            if (emojisInCategory.length === 0) return null;
        
            return (
              <div
                key={category}
                ref={el => {categoryRefs.current[category] = el;}}
                className={styles.emojiCategorySection}
              >
                <div className={styles.categoryLabel}>{category}</div>
                <div className={styles.emojiRow}>
                  {emojisInCategory.map(e => (
                    <span
                      key={e.char}
                      className={styles.emoji}
                      onClick={() => {
                        onSelect(e.char);
                        addRecentEmoji(e.char);
                        console.log([...e.char]);
                      }}
                    >
                      {e.char}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </CustomScrollbar>
        {/*</CustomScrollbar>*/}
      {/*</div>*/}
      </Squircle>
      </div>
    );
};

//const styles: { [key: string]: React.CSSProperties } = {
//  pickerContainer: {
//    position: 'absolute',
//    bottom: '60px',
//    right: '10px',
//    width: '320px',
//    height: '320px',
//    background: 'white',
//    border: '1px solid #ccc',
//    borderRadius: '10px',
//    overflow: 'hidden',
//    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
//    zIndex: 1000
//  },
//  categoryTabs: {
//    display: 'flex',
//    overflowX: 'auto',
//    borderBottom: '1px solid #eee',
//    padding: '6px',
//    backgroundColor: '#f5f5f5'
//  },
//  tabButton: {
//    marginRight: '8px',
//    padding: '4px 10px',
//    background: 'none',
//    border: 'none',
//    cursor: 'pointer',
//    whiteSpace: 'nowrap'
//  },
//  emojiGrid: {
//    display: 'grid',
//    gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
//    padding: '10px',
//    gap: '6px',
//    overflowY: 'auto',
//    height: '260px'
//  },
//  emoji: {
//    fontSize: '22px',
//    cursor: 'pointer',
//    textAlign: 'center',
//    userSelect: 'none'
//  }
//};

export default EmojiPicker;
