"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";
import { completarApisRedLocal } from "./red-local";

completarApisRedLocal();

export default makePage(config);
