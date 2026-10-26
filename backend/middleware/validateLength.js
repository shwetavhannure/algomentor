const MAX_LEN = 6000;

export function rejectLongText(fields) {
  return (req, res, next) => {
    for (const field of fields) {
      const val = req.body[field];
      if (typeof val === 'string' && val.length > MAX_LEN) {
        return res.status(400).json({
          error: `${field} must be at most ${MAX_LEN} characters.`,
        });
      }
    }
    next();
  };
}
