
import { OS } from '../types';

export const detectOS = (): OS => {
  const userAgent = window.navigator.userAgent;
  const platform = (window.navigator as any).platform || '';
  
  if (userAgent.indexOf('Win') !== -1 || platform.indexOf('Win') !== -1) return 'Windows';
  if (userAgent.indexOf('Mac') !== -1 || platform.indexOf('Mac') !== -1) return 'macOS';
  if (userAgent.indexOf('Linux') !== -1 || platform.indexOf('Linux') !== -1) return 'Linux';
  
  return 'Unknown';
};

export const parseNodeVersion = (input: string): string | null => {
  const match = input.match(/v?(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
};

export const parseNpmVersion = (input: string): string | null => {
  const match = input.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
};

export const parsePnpmVersion = (input: string): string | null => {
  const match = input.match(/(\d+\.\d+(\.\d+)?)/);
  return match ? match[1] : null;
};

export const parsePgVersion = (input: string): string | null => {
  const match = input.match(/(\d+\.\d+(\.\d+)?)/);
  return match ? match[1] : null;
};

export const parseRedisVersion = (input: string): string | null => {
  // Matches "redis-cli 7.2.4" or "7.2.4"
  const match = input.match(/(\d+\.\d+(\.\d+)?)/);
  return match ? match[1] : null;
};

export const compareVersions = (current: string | null, min: number): boolean => {
  if (!current) return false;
  const major = parseInt(current.split('.')[0], 10);
  return major >= min;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
