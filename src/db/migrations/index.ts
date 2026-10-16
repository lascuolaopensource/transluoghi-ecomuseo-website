import * as migration_20251120_071658_inital from './20251120_071658_inital';
import * as migration_20261016_085045_localize_residenze_short_description from './20261016_085045_localize_residenze_short_description';
import * as migration_20261016_140126_payload_3_91 from './20261016_140126_payload_3_91';
import * as migration_20261016_171643_social_media_owner from './20261016_171643_social_media_owner';

export const migrations = [
  {
    up: migration_20251120_071658_inital.up,
    down: migration_20251120_071658_inital.down,
    name: '20251120_071658_inital',
  },
  {
    up: migration_20261016_085045_localize_residenze_short_description.up,
    down: migration_20261016_085045_localize_residenze_short_description.down,
    name: '20261016_085045_localize_residenze_short_description',
  },
  {
    up: migration_20261016_140126_payload_3_91.up,
    down: migration_20261016_140126_payload_3_91.down,
    name: '20261016_140126_payload_3_91',
  },
  {
    up: migration_20261016_171643_social_media_owner.up,
    down: migration_20261016_171643_social_media_owner.down,
    name: '20261016_171643_social_media_owner'
  },
];
