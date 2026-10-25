"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";
import { completarCryptoSubtle } from "./sha1-red-local";

completarCryptoSubtle();

export default makePage(config);
