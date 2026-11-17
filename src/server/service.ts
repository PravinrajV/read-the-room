import { GameService } from './game-service';
import { RedisStore } from './redis-store';
import { commentUrlFromContext } from './context-actor';

export const createRedditGameService = () =>
  new GameService({
    store: new RedisStore(),
    commentUrl: commentUrlFromContext(),
  });
