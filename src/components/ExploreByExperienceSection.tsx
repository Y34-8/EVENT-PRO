import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Lang } from '../types/index.ts';
import { SafeImage } from './BrandMark.tsx';

interface ExperienceCard {
  id: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  imageUrl: string;
}

const EXPERIENCES: ExperienceCard[] = [
  {
    id: 'salles',
    slug: 'location-de-salles-et-espaces',
    titleFr: 'Salles',
    titleAr: 'القاعات والفضاءات',
    subtitleFr: 'Palais d’Anfa, villas privées & salons panoramiques',
    subtitleAr: 'قصور أنفا والفيلات الخاصة والصالونات الفاخرة',
    imageUrl: '/src/assets/images/venue_palais_anfa_1795278190140.jpg',
  },
  {
    id: 'photographes',
    slug: 'photographie-et-videographie',
    titleFr: 'Photographes',
    titleAr: 'التصوير الفوتوغرافي',
    subtitleFr: 'Reportage éditorial, cinéma 4K & couverture drone',
    subtitleAr: 'تغطية فوتوغرافية وسينمائية 4K وتصوير بالدرون',
    imageUrl: '/src/assets/images/exp_photographers_1795278355613.jpg',
  },
  {
    id: 'traiteurs',
    slug: 'traiteur-et-restauration',
    titleFr: 'Traiteurs',
    titleAr: 'خدمات التموين',
    subtitleFr: 'Gastronomie marocaine haute couture & arts culinaires',
    subtitleAr: 'المطبخ المغربي الراقي وفنون الضيافة الفاخرة',
    imageUrl: '/src/assets/images/service_gastronomy_catering_1795276605960.jpg',
  },
  {
    id: 'dj',
    slug: 'sonorisation-et-eclairage',
    titleFr: 'DJ',
    titleAr: 'الدي جي والصوتيات',
    subtitleFr: 'DJ sets exclusifs, acoustique & architecture lumière',
    subtitleAr: 'عروض دي جي احترافية وهندسة صوتية وإضاءة مسرحية',
    imageUrl: '/src/assets/images/exp_dj_sound_1795278356000.jpg',
  },
  {
    id: 'decoration',
    slug: 'decoration-et-amenagement',
    titleFr: 'Décoration',
    titleAr: 'الديكور والتصميم',
    subtitleFr: 'Scénographie florale, mobilier & art de la table',
    subtitleAr: 'تنسيق الزهور والأثاث العصري وفنون المائدة',
    imageUrl: '/src/assets/images/masonry_decor_tablescape_1795278030242.jpg',
  },
  {
    id: 'organisation',
    slug: 'mariages-et-ceremonies',
    titleFr: 'Organisation',
    titleAr: 'التنظيم الشامل',
    subtitleFr: 'Direction artistique intégrale & coordination jour J',
    subtitleAr: 'الإشراف الفني الكامل والتنسيق الميداني يوم الحدث',
    imageUrl: '/src/assets/images/exp_organisation_planner_1795278356886.jpg',
  },
];

export function ExploreByExperienceSection({ lang }: { lang: Lang }) {
  return (
    <section
      aria-labelledby="explore-experience-heading"
      className="py-20 lg:py-24 bg-[#FAFAFA] border-b border-neutral-200"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#8E6B1E] mb-3">
              {lang === 'ar'
                ? 'اكتشف حسب التخصص · الدار البيضاء'
                : 'Savourez chaque détail · Casablanca & Maroc'}
            </p>
            <h2
              id="explore-experience-heading"
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0B] text-balance"
            >
              Explore by Experience
            </h2>
            <p className="mt-3 text-base text-neutral-600 max-w-2xl">
              {lang === 'ar'
                ? 'ستة عوالم متكاملة تجمع القاعات والتصوير والتموين والدي جي والديكور والتنظيم تحت إدارة واحدة.'
                : 'Six univers essentiels — salles, photographes, traiteurs, DJ, décoration et organisation — orchestrés avec la même exigence.'}
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0B] hover:text-[#8E6B1E] transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'استعراض كافة التخصصات' : 'Voir toutes nos prestations'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {EXPERIENCES.map((exp, idx) => {
            const title = lang === 'ar' ? exp.titleAr : exp.titleFr;
            const subtitle = lang === 'ar' ? exp.subtitleAr : exp.subtitleFr;

            return (
              <Link
                key={exp.id}
                to={`/services/${exp.slug}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0A0A0B] border border-neutral-200 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B89038]"
              >
                {/* Photo with smooth optical zoom on hover */}
                <SafeImage
                  src={exp.imageUrl}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none motion-reduce:transform-none"
                />

                {/* Subtle base gradient for clean resting readability */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/80 via-[#0A0A0B]/20 to-transparent transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0"
                />

                {/* Progressive dark veil emerging smoothly on hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/95 via-[#0A0A0B]/70 to-[#0A0A0B]/40 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
                />

                {/* Resting bottom label (fades out cleanly as gold hover title takes center stage) */}
                <div className="absolute inset-x-0 bottom-0 p-7 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-2 group-focus-visible:opacity-0">
                  <span className="font-mono text-xs text-neutral-300 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-1">
                    {title}
                  </h3>
                </div>

                {/* Gold Title & Editorial Subtitle revealed progressively on hover */}
                <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-mono text-xs tracking-widest text-[#D4AE5E]/80 mb-3 opacity-0 translate-y-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <h3 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#D4AE5E] opacity-0 translate-y-4 transition-all duration-500 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0">
                    {title}
                  </h3>

                  <span
                    aria-hidden="true"
                    className="w-10 h-px bg-[#D4AE5E]/70 my-4 scale-x-0 transition-transform duration-500 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />

                  <p className="text-sm text-neutral-200 max-w-[26ch] leading-relaxed opacity-0 translate-y-3 transition-all duration-500 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0">
                    {subtitle}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white opacity-0 translate-y-3 transition-all duration-500 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0">
                    {lang === 'ar' ? 'اكتشف التجربة' : 'Découvrir'}
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AE5E]" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
