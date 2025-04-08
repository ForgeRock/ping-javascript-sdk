/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export type OathDevice = {
  id: string;
  deviceName: string;
  uuid: string;
  createdDate: Date;
  lastAccessDate: Date;
};

export type DeleteOathQuery = {
  realm?: string;
  userId: string;
  uuid: string;
};

export type RetrieveOathQuery = {
  realm?: string;
  userId: string;
};

export type OAthResponse = {
  _id: string;
  _rev: string;
  createdDate: number;
  lastAccessDate: number;
  deviceName: string;
  uuid: string;
  deviceManagementStatus: boolean;
}[];

export type DeletedOAthDevice = {
  _id: string;
  _rev: string;
  uuid: string;
  recoveryCodes: string[];
  createdDate: number;
  lastAccessDate: number;
  sharedSecret: string;
  deviceName: string;
  lastLogin: number;
  counter: number;
  checksumDigit: boolean;
  truncationOffset: number;
  clockDriftSeconds: number;
};
