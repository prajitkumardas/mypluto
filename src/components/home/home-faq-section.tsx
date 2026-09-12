"use client";

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, type Variants, useReducedMotion } from 'motion/react';
import { type CSSProperties, useState } from 'react';
import styles from './home-faq-section.module.css';

const faqItems = [
  {
    id: 'what-is-pluto-finds',
    question: 'What is Pluto Finds?',
    answer: 'Pluto Finds is a curated AI tools discovery platform. It organizes tools by category, use case, pricing, platform support and other practical details so you can evaluate useful options without opening dozens of tabs.'
  },
  {
    id: 'find-the-right-tool',
    question: 'How do I find the right AI tool?',
    answer: 'Start in Pluto’s Library to search and filter the catalog, browse Pluto Guides for goal-based recommendations, check Trending to see what is gaining attention, or use Compare to review shortlisted tools side by side.'
  },
  {
    id: 'verified-tool',
    question: 'What does it mean when a tool is verified?',
    answer: 'Verification means the tool’s website availability, pricing and key features have been checked. AI can flag possible changes, but critical listing information is reviewed by an admin before it is published.'
  },
  {
    id: 'trending-rankings',
    question: 'How are Trending tools ranked?',
    answer: 'Trending results reflect the selected time window and use Pluto trend snapshots when they are available. If those signals are unavailable, the experience falls back to popularity indicators from the curated library data.'
  },
  {
    id: 'submit-a-tool',
    question: 'Can I submit an AI tool to Pluto Finds?',
    answer: 'Yes. Use the Submit a Tool flow to share the product details, pricing, platform support and verification information. The submission can then be reviewed before it appears in the library.'
  }
] as const;

const answerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.018 } }
};

const answerWord: Variants = {
  hidden: { filter: 'blur(8px)', opacity: 0, y: 4 },
  visible: {
    filter: 'blur(0px)',
    opacity: 1,
    transition: { duration: 0.28, ease: 'easeOut' },
    y: 0
  }
};

type FireflyStyle = CSSProperties & {
  '--firefly-x': string;
  '--firefly-y': string;
  '--firefly-size': string;
  '--firefly-blur': string;
  '--firefly-travel-y': string;
  '--firefly-mid-a-y': string;
  '--firefly-mid-b-y': string;
  '--firefly-mid-c-y': string;
  '--firefly-sway-a': string;
  '--firefly-sway-b': string;
  '--firefly-sway-c': string;
  '--firefly-end-x': string;
  '--firefly-delay': string;
  '--firefly-duration': string;
};

const fireflies: Array<{ id: number; style: FireflyStyle }> = Array.from({ length: 30 }, (_, index) => {
  const rise = valueBetween(index, 1, 8, 20);
  const duration = valueBetween(index, 2, 5.4, 10.2);

  return {
    id: index,
    style: {
      '--firefly-x': valueBetween(index, 3, 3, 78).toFixed(2) + '%',
      '--firefly-y': valueBetween(index, 4, 1, 20).toFixed(2) + '%',
      '--firefly-size': valueBetween(index, 5, 0.08, 0.24).toFixed(3) + 'rem',
      '--firefly-blur': valueBetween(index, 6, 0, 0.55).toFixed(2) + 'px',
      '--firefly-travel-y': (-rise).toFixed(2) + 'rem',
      '--firefly-mid-a-y': (-rise * 0.31).toFixed(2) + 'rem',
      '--firefly-mid-b-y': (-rise * 0.59).toFixed(2) + 'rem',
      '--firefly-mid-c-y': (-rise * 0.82).toFixed(2) + 'rem',
      '--firefly-sway-a': valueBetween(index, 7, -1.8, 1.8).toFixed(2) + 'rem',
      '--firefly-sway-b': valueBetween(index, 8, -2.2, 2.2).toFixed(2) + 'rem',
      '--firefly-sway-c': valueBetween(index, 9, -1.5, 1.5).toFixed(2) + 'rem',
      '--firefly-end-x': valueBetween(index, 10, -2.8, 2.8).toFixed(2) + 'rem',
      '--firefly-delay': (-valueBetween(index, 11, 0, duration)).toFixed(2) + 's',
      '--firefly-duration': duration.toFixed(2) + 's'
    }
  };
});

function valueBetween(index: number, salt: number, minimum: number, maximum: number) {
  let value = Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(salt + 1, 0x27d4eb2d);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  const normalized = ((value ^ (value >>> 16)) >>> 0) / 4294967295;
  return minimum + (maximum - minimum) * normalized;
}

export function HomeFaqSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <section aria-labelledby='home-faq-title' className={styles.section} id='faq'>
      <div aria-hidden='true' className={styles.glow} />
      <div aria-hidden='true' className={styles.fireflies}>
        {fireflies.map((particle) => (
          <span key={particle.id} style={particle.style} />
        ))}
      </div>
      <motion.div
        aria-hidden='true'
        className={styles.artwork}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98, y: '24%' }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: 1.05, ease: [0.22, 1, 0.36, 1] }
        }
        viewport={{ amount: 0.18, margin: '0px 0px -8% 0px', once: true }}
        whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1, y: '0%' }}
      >
        <Image
          alt=''
          className={styles.artworkImage}
          height={941}
          sizes='(max-width: 960px) 92vw, 58vw'
          src='/images/home/faq-corner.png'
          width={1672}
        />
      </motion.div>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>FAQs</p>
          <h1 className={styles.title} id='home-faq-title'>
            Questions, <span>answered.</span>
          </h1>
          <p className={styles.copy}>
            The essentials for finding, comparing and choosing AI tools with confidence.
          </p>
          <p className={styles.support}>
            Still curious? Write to{' '}
            <a className={styles.supportLink} href='mailto:hello@plutofinds.com'>
              hello@plutofinds.com
            </a>
          </p>
        </div>

        <div className={styles.list}>
          {faqItems.map((item) => (
            <FaqItem
              isOpen={openItem === item.id}
              item={item}
              key={item.id}
              onToggle={() => setOpenItem(openItem === item.id ? null : item.id)}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({
  isOpen,
  item,
  onToggle,
  reducedMotion
}: {
  isOpen: boolean;
  item: (typeof faqItems)[number];
  onToggle: () => void;
  reducedMotion: boolean;
}) {
  const triggerId = item.id + '-trigger';
  const panelId = item.id + '-panel';

  return (
    <article className={styles.item} data-open={isOpen || undefined}>
      <h2 className={styles.questionHeading}>
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className={styles.trigger}
          id={triggerId}
          onClick={onToggle}
          type='button'
        >
          <span>{item.question}</span>
          <span aria-hidden='true' className={styles.icon}>
            <ChevronDown />
          </span>
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            aria-labelledby={triggerId}
            className={styles.answerClip}
            exit={{ height: 0, opacity: 0 }}
            id={panelId}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            key={panelId}
            role='region'
            transition={reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.answerBody}>
              {reducedMotion ? (
                <p className={styles.answer}>{item.answer}</p>
              ) : (
                <>
                  <p className='sr-only'>{item.answer}</p>
                  <motion.p
                    animate='visible'
                    aria-hidden='true'
                    className={styles.answer}
                    initial='hidden'
                    variants={answerContainer}
                  >
                    {item.answer.split(' ').map((word, index) => (
                      <motion.span className={styles.word} key={item.id + '-' + index} variants={answerWord}>
                        {word}{'\u00A0'}
                      </motion.span>
                    ))}
                  </motion.p>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
