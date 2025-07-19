# UI Styling Guide

Complete guide for creating beautiful and consistent user interfaces in the Edrac CBT platform.

## 🎨 Design System Overview

The Edrac platform uses a modern design system built on:
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

## 🌈 Color Palette & Theme

### Primary Colors

```css
/* File: client/src/index.css */

:root {
  /* Primary brand colors */
  --primary: 221.2 83.2% 53.3%;        /* Blue #4F46E5 */
  --primary-foreground: 210 40% 98%;   /* White text on primary */
  
  /* Secondary colors */
  --secondary: 210 40% 96%;            /* Light gray */
  --secondary-foreground: 222.2 84% 4.9%; /* Dark text on secondary */
  
  /* Accent colors */
  --accent: 210 40% 96%;               /* Subtle highlight */
  --accent-foreground: 222.2 84% 4.9%;
  
  /* Status colors */
  --destructive: 0 84.2% 60.2%;       /* Red for errors */
  --warning: 38 92% 50%;               /* Orange for warnings */
  --success: 142 76% 36%;              /* Green for success */
  
  /* Neutral colors */
  --background: 0 0% 100%;             /* White background */
  --foreground: 222.2 84% 4.9%;       /* Dark text */
  --muted: 210 40% 96%;                /* Muted backgrounds */
  --muted-foreground: 215.4 16.3% 46.9%; /* Muted text */
}

.dark {
  /* Dark mode colors */
  --background: 222.2 84% 4.9%;       /* Dark background */
  --foreground: 210 40% 98%;          /* Light text */
  --primary: 217.2 91.2% 59.8%;       /* Brighter blue for dark mode */
  --muted: 217.2 32.6% 17.5%;         /* Dark muted backgrounds */
  --muted-foreground: 215 20.2% 65.1%; /* Light muted text */
}
```

### Using Colors in Components

```typescript
// Tailwind color classes
<div className="bg-primary text-primary-foreground">Primary button</div>
<div className="bg-secondary text-secondary-foreground">Secondary area</div>
<div className="bg-destructive text-destructive-foreground">Error message</div>
<div className="bg-success text-success-foreground">Success message</div>

// Background variations
<div className="bg-background">Main background</div>
<div className="bg-muted">Subtle background</div>
<div className="bg-card">Card background</div>

// Text colors
<p className="text-foreground">Main text</p>
<p className="text-muted-foreground">Secondary text</p>
<p className="text-primary">Brand text</p>
```

## 🧩 Core UI Components

### Button Variants

```typescript
import { Button } from "@/components/ui/button";

// Primary actions
<Button className="bg-primary hover:bg-primary/90">
  Primary Action
</Button>

// Secondary actions
<Button variant="secondary">
  Secondary Action
</Button>

// Destructive actions
<Button variant="destructive">
  Delete Item
</Button>

// Outline style
<Button variant="outline">
  Cancel
</Button>

// Ghost style (subtle)
<Button variant="ghost">
  Ghost Button
</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With icons
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

### Card Components

```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Basic card structure
<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      Brief description of the card content
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Statistics card
<Card className="p-6">
  <div className="flex items-center space-x-4">
    <div className="p-2 bg-primary/10 rounded-lg">
      <Users className="h-6 w-6 text-primary" />
    </div>
    <div>
      <h3 className="text-2xl font-bold">1,234</h3>
      <p className="text-sm text-muted-foreground">Total Users</p>
    </div>
  </div>
</Card>
```

### Form Components

```typescript
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Text input
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email"
    className="w-full"
  />
</div>

// Textarea
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea 
    id="description" 
    placeholder="Enter description"
    rows={4}
  />
</div>

// Select dropdown
<div className="space-y-2">
  <Label htmlFor="role">Role</Label>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select a role" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="student">Student</SelectItem>
      <SelectItem value="teacher">Teacher</SelectItem>
      <SelectItem value="admin">Administrator</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## 📱 Responsive Design Patterns

### Grid Layouts

```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>

// Dashboard layout
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Sidebar */}
  <div className="lg:col-span-1">
    <Card>Sidebar content</Card>
  </div>
  
  {/* Main content */}
  <div className="lg:col-span-3">
    <Card>Main content</Card>
  </div>
</div>

// Statistics cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
        <p className="text-2xl font-bold">1,234</p>
      </div>
      <Users className="h-8 w-8 text-muted-foreground" />
    </div>
  </Card>
  {/* More stat cards */}
</div>
```

### Flex Layouts

```typescript
// Navigation header
<header className="flex items-center justify-between p-4 border-b">
  <div className="flex items-center space-x-4">
    <h1 className="text-xl font-bold">Edrac</h1>
  </div>
  
  <div className="flex items-center space-x-2">
    <Button variant="ghost" size="sm">Profile</Button>
    <Button variant="outline" size="sm">Logout</Button>
  </div>
</header>

// Content with sidebar
<div className="flex min-h-screen">
  {/* Sidebar */}
  <aside className="w-64 bg-muted/50 p-4">
    <nav className="space-y-2">
      <Button variant="ghost" className="w-full justify-start">
        <Home className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
      {/* More nav items */}
    </nav>
  </aside>
  
  {/* Main content */}
  <main className="flex-1 p-6">
    <div className="max-w-7xl mx-auto">
      {/* Page content */}
    </div>
  </main>
</div>
```

## 🎭 Animation & Transitions

### Framer Motion Patterns

```typescript
import { motion } from "framer-motion";

// Fade in animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content that fades in
</motion.div>

// Slide in from bottom
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.4 }}
>
  Content that slides up
</motion.div>

// Staggered list animation
<motion.div className="space-y-4">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card>{/* Card content */}</Card>
    </motion.div>
  ))}
</motion.div>

// Scale on hover
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="cursor-pointer"
>
  <Card>Interactive card</Card>
</motion.div>
```

### CSS Transitions

```typescript
// Hover effects
<Button className="transition-all duration-200 hover:shadow-lg transform hover:scale-105">
  Hover me
</Button>

// Loading states
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>

// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
```

## 🌗 Dark Mode Implementation

### Theme Provider Setup

```typescript
// File: client/src/components/system/ThemeProvider.tsx

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem("theme", theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
```

### Theme Toggle Component

```typescript
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/system/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### Dark Mode Color Usage

```typescript
// Always use dark mode variants for consistent theming
<div className="bg-background text-foreground">
  <div className="bg-card border border-border rounded-lg p-6">
    <h2 className="text-foreground">Title</h2>
    <p className="text-muted-foreground">Description</p>
    
    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
      Action
    </Button>
  </div>
</div>
```

## 📊 Data Visualization

### Chart Components with Recharts

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Bar chart
<Card className="p-6">
  <CardHeader>
    <CardTitle>Monthly Performance</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-muted-foreground" />
        <YAxis className="text-muted-foreground" />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Bar dataKey="score" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

// Progress indicators
<div className="space-y-3">
  <div className="flex justify-between text-sm">
    <span>Mathematics</span>
    <span>85%</span>
  </div>
  <Progress value={85} className="h-2" />
</div>
```

## 🎯 Component Layout Patterns

### Dashboard Layout

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <h1 className="text-xl font-bold">Edrac</h1>
          </div>
          
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Button variant="ghost">Dashboard</Button>
            <Button variant="ghost">Exams</Button>
            <Button variant="ghost">Progress</Button>
          </nav>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm">Profile</Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-muted/50 lg:block">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                <Button variant="secondary" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                {/* More sidebar items */}
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### Modal/Dialog Pattern

```typescript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to perform this action? This cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="flex space-x-2">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 🔧 Utility Classes & Patterns

### Common Spacing

```typescript
// Consistent spacing scale
<div className="space-y-4">      {/* 1rem vertical space */}
<div className="space-y-6">      {/* 1.5rem vertical space */}
<div className="space-x-2">      {/* 0.5rem horizontal space */}

// Padding and margin
<div className="p-4">            {/* 1rem padding all sides */}
<div className="px-6 py-4">      {/* 1.5rem horizontal, 1rem vertical */}
<div className="mt-8 mb-4">      {/* 2rem top, 1rem bottom margin */}
```

### Container Patterns

```typescript
// Page container
<div className="container mx-auto px-4 py-8 max-w-7xl">
  {/* Page content */}
</div>

// Section spacing
<section className="py-12">
  <div className="container mx-auto">
    <h2 className="text-3xl font-bold mb-8">Section Title</h2>
    {/* Section content */}
  </div>
</section>

// Card grid container
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Cards */}
  </div>
</div>
```

### Loading States

```typescript
// Skeleton loading
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-muted rounded w-3/4"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
  <div className="h-10 bg-muted rounded"></div>
</div>

// Button loading state
<Button disabled={isLoading}>
  {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

This styling guide ensures consistent, beautiful, and accessible user interfaces throughout the Edrac platform. Follow these patterns to maintain design consistency and create excellent user experiences.