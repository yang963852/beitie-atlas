import { findEntry } from '../domain/library';
import { useLocale } from '../i18n';
import { KnowledgeProse } from './KnowledgeProse';

const stone = 'yan-qinli-original-stele';
const album = 'dpm-rubbing-xin00045406';

export function YanQinliStory({ objectId }: { objectId: string }) {
  const { locale } = useLocale();
  const zh = locale === 'zh';
  if (objectId !== stone && objectId !== album) return null;
  const story = findEntry('notes', 'yan-qinli-story')?.guide;
  if (!story) return null;

  return (
    <section className="section reading-story" aria-labelledby="story-heading">
      <p className="section__meta">{zh ? '碑帖故事 · 试读' : 'Stele stories · Draft'}</p>
      <h3 id="story-heading"><a href="#/note/yan-qinli-story">{zh ? story.titleZh : story.titleEn}</a></h3>
      <KnowledgeProse guide={story} />
            <details className="story-place">
              <summary>{zh ? '看出土处与西安鼓楼的方位' : 'Locate the find area relative to the Xi’an Drum Tower'}</summary>
              <figure>
                <div className="story-compass" aria-hidden="true">
                  <span>{zh ? '北 ↑' : 'North ↑'}</span>
                  <strong>{zh ? '省长公署一带' : 'Governor’s compound area'}</strong>
                  <b>{zh ? '鼓楼' : 'Drum Tower'}</b>
                </div>
                <figcaption>{zh ? '馆方将省长公署旧址描述在今西安鼓楼以东及东北一带。图示方位，距离和出土点未详。' : 'The museum places the former compound east and northeast of today’s Drum Tower. The diagram shows direction only. Distance and the precise findspot are unknown.'}</figcaption>
              </figure>
            </details>
      <a href={'#/object/' + (objectId === stone ? album : stone)}>
        {objectId === stone
          ? (zh ? '翻看故宫的民国拓本 →' : 'Open the Palace Museum rubbing →')
          : (zh ? '翻看西安碑林的原石 →' : 'Open the original stone at Xi’an Beilin →')}
      </a>
    </section>
  );
}
