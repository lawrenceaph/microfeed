import FeedDb from "../../edge-src/models/FeedDb";
import {SETTINGS_CATEGORIES} from "../../common-src/Constants";

async function fetchFeedAndAuth({request, next, env, data}) {
  const feedDb = new FeedDb(env, request);
  const contentFromDb = await feedDb.getContent()

  data.feedDb = feedDb;
  data.feedContent = contentFromDb;

  if (contentFromDb.settings) {
    const apiSettings = contentFromDb.settings[SETTINGS_CATEGORIES.API_SETTINGS];
    if (apiSettings) {
      if (apiSettings.enabled) {
        const bearerToken = request.headers.get('Authorization');
        try {
          const token = bearerToken.split(' ')[1];
          const tokenMatched = apiSettings.apps.some(app => app.token === token);
          if (token && tokenMatched) {
            return next();
          }
        } catch(e) {} // eslint-disable-line no-empty
      }
    }
  }
  return new Response('Unauthorized', {status: 401});
}

export const onRequest = [fetchFeedAndAuth];
