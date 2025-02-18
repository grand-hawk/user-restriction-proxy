import { Router } from 'express';

const router = Router();

router.get('/healthcheck', (req, res) => res.status(200).end());

export default router;
