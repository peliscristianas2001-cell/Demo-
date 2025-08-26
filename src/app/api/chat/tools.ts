'use server';
/**
 * @fileOverview Tools for the chatbot Genkit flow to access application data.
 * These functions are designed to be called by the AI model.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {mockTours, mockSellers, mockPassengers} from '@/lib/mock-data';
import type {Tour, Seller, GeneralSettings} from '@/lib/types';

// IMPORTANT: In a real-world application, these functions would fetch data from a database.
// For this prototype, we simulate that by reading from the mock data,
// which acts as our 'database'.

const getToursFromStorage = (): Tour[] => {
  // This function simulates reading from a persistent data source.
  return mockTours;
};

const getSellersFromStorage = (): Seller[] => {
  return mockSellers;
};

const getGeneralSettingsFromStorage = (): Partial<GeneralSettings> => {
  // Simulate reading general settings
  return {
    mainWhatsappNumber: '1111111111', // Example admin number
  };
};

export const getAvailableTours = ai.defineTool(
  {
    name: 'getAvailableTours',
    description:
      'Get a list of currently available and upcoming travel tours.',
    input: z.object({}),
    output: z.array(
      z.object({
        destination: z.string(),
        date: z.string().describe('The departure date in ISO format'),
        price: z.number().describe('The base price for an adult'),
      })
    ),
  },
  async () => {
    const tours = getToursFromStorage();
    const activeTours = tours.filter(
      (tour) => new Date(tour.date) >= new Date()
    );

    return activeTours.map((tour) => ({
      destination: tour.destination,
      date: tour.date.toISOString(),
      price: tour.price,
    }));
  }
);

export const getContactInfo = ai.defineTool(
  {
    name: 'getContactInfo',
    description:
      "Get the contact WhatsApp numbers for the agency's administrator and sellers.",
    input: z.object({}),
    output: z.object({
      admin: z
        .string()
        .optional()
        .describe("The main administrator's WhatsApp number."),
      sellers: z
        .array(
          z.object({
            name: z.string(),
            phone: z.string(),
          })
        )
        .describe('A list of sellers and their WhatsApp numbers.'),
    }),
  },
  async () => {
    const sellers = getSellersFromStorage();
    const settings = getGeneralSettingsFromStorage();
    const adminSeller = sellers.find((s) => s.dni === '99999999');

    return {
      admin: adminSeller?.phone || settings.mainWhatsappNumber,
      sellers: sellers
        .filter((s) => s.phone && s.dni !== '99999999') // Exclude admin from the list
        .map((s) => ({name: s.name, phone: s.phone})),
    };
  }
);
