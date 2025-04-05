import { Router } from 'express';

const router = Router();

router.get('/healthcheck', (_req, res) => res.status(200).end());

export default router;
