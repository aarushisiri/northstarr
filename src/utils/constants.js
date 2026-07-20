import {
  Droplet, Footprints, Dumbbell, Shield, BookMarked, UtensilsCrossed,
} from "lucide-react";

// Every task in the timeline belongs to exactly one of these systems.
export const SYSTEMS = [
  "Health",
  "Career",
  "Work Excellence",
  "Cybersecurity",
  "Computer Science Exploration",
  "Culture Exploration",
  "Wealth Management",
  "Home",
  "Mindset",
  "Relationships",
];

// Short badge text shown on system cards.
export const SYSTEM_SHORT = {
  "Health": "HLTH",
  "Career": "CARR",
  "Work Excellence": "WORK",
  "Cybersecurity": "SEC",
  "Computer Science Exploration": "CS",
  "Culture Exploration": "CULT",
  "Wealth Management": "WLTH",
  "Home": "HOME",
  "Mindset": "MIND",
  "Relationships": "REL",
};

// Quick Stats shown on the Home page.
export const STAT_DEFS = [
  { key: "water", label: "Water", icon: Droplet, kind: "fraction" },
  { key: "steps", label: "Steps", icon: Footprints, kind: "fraction" },
  { key: "workout1", label: "Workout 1", icon: Dumbbell, kind: "bool" },
  { key: "workout2", label: "Workout 2", icon: Dumbbell, kind: "bool" },
  { key: "cyberday", label: "Cyber Day", icon: Shield, kind: "bool" },
  { key: "reading", label: "Reading", icon: BookMarked, kind: "bool" },
  { key: "mealprep", label: "Meal Prep", icon: UtensilsCrossed, kind: "bool" },
];

export const STORAGE_KEY = "northstar:state:v1";
