import { Application } from 'express';
import { dateFormat } from './date.helper';
import { moneyFormat } from './money.helper'; // <- novo helper

const helpers: Record<string, unknown> = {
    dateFormat,
    moneyFormat
};

export const registerHelpers = (app: Application): void => {
    Object.assign(app.locals, helpers);
};