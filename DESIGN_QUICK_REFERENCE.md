# Design Quick Reference
## Copy-Paste Style Guide

**Use this for consistent styling across all components**

---

## 🎨 Color Variables

```tsx
// Text Colors
className="text-black"                    // Primary text, headings
className="text-neutral-600"              // Body text, descriptions
className="text-neutral-500"              // Secondary text
className="text-neutral-400"              // Meta text, placeholders

// Backgrounds
className="bg-white"                      // Main background
className="bg-neutral-50"                 // Subtle backgrounds

// Borders
className="border-black"                  // Active, hover, focus
className="border-neutral-200"            // Default state
className="border-neutral-100"            // Subtle dividers
```

---

## 📏 Typography Classes

### Hero / Display Text
```tsx
className="text-[56px] sm:text-[72px] lg:text-[88px] font-semibold tracking-[-0.03em] leading-[0.95]"
```

### Large Heading
```tsx
className="text-[19px] sm:text-[21px] font-normal tracking-[-0.01em] leading-[1.45]"
```

### Body Text (Primary)
```tsx
className="text-[17px] font-semibold tracking-[-0.01em]"
```

### Body Text (Secondary)
```tsx
className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]"
```

### Small Text
```tsx
className="text-[13px] font-medium tracking-[-0.01em]"
```

### Label / Meta Text
```tsx
className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium"
```

---

## 📦 Component Templates

### Primary Button
```tsx
<button
  className="inline-flex items-center gap-3 px-16 py-5 text-[15px] font-medium tracking-[-0.01em] border border-black hover:bg-black hover:text-white transition-all duration-300 disabled:border-neutral-200 disabled:text-neutral-300 disabled:cursor-not-allowed"
>
  Button Text
  <ArrowRightOutlined style={{ fontSize: '14px' }} />
</button>
```

### Secondary Button
```tsx
<button
  className="inline-flex items-center gap-2 px-8 py-3 text-[13px] font-medium tracking-[-0.01em] border border-neutral-200 hover:border-black transition-colors"
>
  Button Text
</button>
```

### Icon Button (Close/Dismiss)
```tsx
<button
  className="w-8 h-8 flex items-center justify-center border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all"
>
  <CloseOutlined style={{ fontSize: '12px' }} />
</button>
```

---

### Text Input
```tsx
<input
  type="text"
  className="w-full px-8 py-4 text-[15px] tracking-[-0.01em] border border-neutral-200 focus:border-black focus:outline-none transition-colors"
  placeholder="Placeholder text"
/>
```

### Textarea
```tsx
<textarea
  className="w-full px-8 py-8 text-[15px] tracking-[-0.01em] leading-[1.6] border border-neutral-200 focus:border-black focus:outline-none resize-none transition-colors"
  placeholder="Placeholder text"
  rows={10}
/>
```

---

### Upload Zone (Empty)
```tsx
<div
  className="border border-neutral-200 hover:border-neutral-400 transition-all duration-300 cursor-pointer px-12 py-20"
>
  <div className="text-center">
    <CloudUploadOutlined 
      style={{ fontSize: '48px' }} 
      className="text-neutral-300 mb-8"
    />
    <p className="text-[19px] font-medium mb-3 tracking-[-0.01em]">
      Upload your file
    </p>
    <p className="text-[15px] text-neutral-500 mb-6 tracking-[-0.01em]">
      Drop file here or click to browse
    </p>
    <p className="text-[11px] text-neutral-400 tracking-[0.08em] uppercase font-medium">
      File format info
    </p>
  </div>
</div>
```

### Upload Zone (File Selected)
```tsx
<div className="border border-black px-12 py-20">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-6">
      <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0">
        <FileTextOutlined style={{ fontSize: '20px' }} />
      </div>
      <div>
        <p className="text-[17px] font-medium mb-1 tracking-[-0.01em]">
          filename.pdf
        </p>
        <p className="text-[13px] text-neutral-500 tracking-[-0.01em]">
          120 KB • Ready to analyze
        </p>
      </div>
    </div>
    <button className="w-8 h-8 flex items-center justify-center border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all">
      <CloseOutlined style={{ fontSize: '12px' }} />
    </button>
  </div>
</div>
```

---

### Error Message
```tsx
<div className="p-6 border border-black bg-white mb-12">
  <div className="flex items-start justify-between gap-4">
    <p className="text-[13px] font-medium tracking-[-0.01em]">
      Error message text
    </p>
    <button
      onClick={() => setError('')}
      className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity"
    >
      <CloseOutlined style={{ fontSize: '10px' }} />
    </button>
  </div>
</div>
```

---

### Feature Card
```tsx
<div>
  <div className="w-10 h-10 border border-black flex items-center justify-center mb-8">
    <CheckSquareOutlined style={{ fontSize: '18px' }} />
  </div>
  <h3 className="text-[17px] font-semibold mb-4 tracking-[-0.01em]">
    Feature Title
  </h3>
  <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
    Feature description goes here with detailed explanation.
  </p>
</div>
```

---

### Navigation Bar
```tsx
<div className="border-b border-neutral-100">
  <div className="max-w-7xl mx-auto px-8 sm:px-12 py-5 flex justify-between items-center">
    <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium">
      Brand Name
    </div>
    <Link 
      href="/link"
      className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 hover:text-black transition-colors font-medium"
    >
      Link Text
    </Link>
  </div>
</div>
```

---

### Section Divider
```tsx
<div className="border-t border-neutral-100" />
```

---

## 📐 Spacing Scale

```tsx
// Padding (Component Internal)
className="p-6"        // 24px - Tight
className="p-8"        // 32px - Default
className="p-12"       // 48px - Generous
className="p-20"       // 80px - Large areas

// Margin Bottom (Vertical Rhythm)
className="mb-3"       // 12px - Tight related items
className="mb-4"       // 16px - Related items
className="mb-6"       // 24px - Component spacing
className="mb-8"       // 32px - Section element
className="mb-12"      // 48px - Major element
className="mb-20"      // 80px - Between sections
className="mb-32"      // 128px - Major sections

// Gap (Flexbox/Grid)
className="gap-2"      // 8px - Tight
className="gap-3"      // 12px - Default
className="gap-4"      // 16px - Comfortable
className="gap-6"      // 24px - Generous
className="gap-20"     // 80px - Feature spacing

// Page Padding
className="px-8 sm:px-12"   // Horizontal
className="py-24 sm:py-32"  // Section vertical
```

---

## 🎭 Icon Sizing

```tsx
// Hero Icons
style={{ fontSize: '48px' }}

// Feature Icons
style={{ fontSize: '18px' }}
style={{ fontSize: '20px' }}

// Button Icons
style={{ fontSize: '14px' }}

// Small Action Icons
style={{ fontSize: '10px' }}
style={{ fontSize: '12px' }}
```

---

## 🔄 Common Transitions

```tsx
// Default (all properties)
className="transition-all duration-300"

// Colors only
className="transition-colors duration-300"

// Transform
className="transition-transform duration-300"

// Opacity
className="transition-opacity"
```

---

## 📱 Responsive Patterns

### Text Scaling
```tsx
className="text-[56px] sm:text-[72px] lg:text-[88px]"
```

### Padding Adjustment
```tsx
className="px-8 sm:px-12"
className="py-24 sm:py-32"
```

### Grid Columns
```tsx
className="grid md:grid-cols-3 gap-20"
```

---

## ⚡️ State Patterns

### Hover States
```tsx
// Invert
className="border border-black hover:bg-black hover:text-white"

// Subtle
className="hover:opacity-60"
className="hover:border-neutral-400"

// Transform
className="hover:translate-x-1"
```

### Focus States
```tsx
className="focus:border-black focus:outline-none"
```

### Disabled States
```tsx
className="disabled:border-neutral-200 disabled:text-neutral-300 disabled:cursor-not-allowed"
```

### Active States
```tsx
className="active:scale-98"  // Subtle press effect
```

---

## 🎯 Layout Containers

```tsx
// Full width nav/footer
<div className="max-w-7xl mx-auto px-8 sm:px-12">

// Hero sections
<div className="max-w-5xl mx-auto px-8 sm:px-12">

// Form/Content
<div className="max-w-4xl mx-auto px-8 sm:px-12">

// Features
<div className="max-w-6xl mx-auto px-8 sm:px-12">
```

---

## 📋 Common Ant Design Icons

```tsx
import {
  CloudUploadOutlined,     // Upload
  FileTextOutlined,        // Document
  ArrowRightOutlined,      // Forward
  CloseOutlined,           // Close/Remove
  CheckSquareOutlined,     // Features/Done
  ThunderboltOutlined,     // Speed/Power
  LineChartOutlined,       // Analytics
  WarningOutlined,         // Warning
  CheckCircleOutlined,     // Success
  InfoCircleOutlined,      // Information
} from '@ant-design/icons';
```

---

## 🚫 Anti-Patterns (Don't Use)

```tsx
// ❌ NO rounded corners
className="rounded-lg"
className="rounded-full"

// ❌ NO shadows
className="shadow-lg"
className="drop-shadow"

// ❌ NO color accents
className="bg-blue-500"
className="text-red-600"

// ❌ NO gradients
className="bg-gradient-to-r"

// ❌ NO arbitrary spacing
className="p-5"    // Use p-4 or p-6
className="mt-7"   // Use mt-6 or mt-8
```

---

## ✅ Best Practices

### 1. Always Use Sharp Corners
```tsx
✅ border            // No border-radius
❌ border rounded    // Never add rounded
```

### 2. Consistent Icon Sizing
```tsx
✅ style={{ fontSize: '18px' }}
❌ className="text-lg"  // Less precise
```

### 3. Precise Typography
```tsx
✅ text-[15px]           // Exact size
❌ text-sm               // Variable size
```

### 4. Proper Tracking
```tsx
✅ tracking-[-0.01em]    // Large text
✅ tracking-[0.08em]     // Small caps
❌ tracking-normal        // Generic
```

### 5. Semantic Spacing
```tsx
✅ mb-8   // 32px (8px × 4)
✅ mb-12  // 48px (8px × 6)
❌ mb-10  // 40px (not 8px multiple)
```

---

## 🎨 Complete Page Template

```tsx
<main className="min-h-screen bg-white">
  {/* Top Navigation */}
  <div className="border-b border-neutral-100">
    <div className="max-w-7xl mx-auto px-8 sm:px-12 py-5 flex justify-between items-center">
      <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium">
        Brand
      </div>
      <Link 
        href="/link"
        className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 hover:text-black transition-colors font-medium"
      >
        Link
      </Link>
    </div>
  </div>

  {/* Hero Section */}
  <div className="border-b border-neutral-100">
    <div className="max-w-5xl mx-auto px-8 sm:px-12 pt-32 pb-40 text-center">
      <h1 className="text-[56px] sm:text-[72px] lg:text-[88px] font-semibold mb-8 tracking-[-0.03em] leading-[0.95]">
        Your Headline Here
      </h1>
      <p className="text-[19px] sm:text-[21px] font-normal text-neutral-600 max-w-2xl mx-auto leading-[1.45] tracking-[-0.01em]">
        Your supporting text goes here
      </p>
    </div>
  </div>

  {/* Content Section */}
  <div className="max-w-4xl mx-auto px-8 sm:px-12 py-24 sm:py-32">
    {/* Your content */}
  </div>

  {/* Features Section */}
  <div className="border-t border-neutral-100 bg-neutral-50">
    <div className="max-w-6xl mx-auto px-8 sm:px-12 py-32">
      <div className="grid md:grid-cols-3 gap-20">
        {/* Features */}
      </div>
    </div>
  </div>

  {/* Footer */}
  <footer className="border-t border-neutral-100 py-6">
    <div className="max-w-7xl mx-auto px-8 sm:px-12">
      <p className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 text-center font-medium">
        Footer Text
      </p>
    </div>
  </footer>
</main>
```

---

## 🔧 Development Tips

### Testing Hover States
```bash
# Check all hover states work
# Check transitions are smooth (300ms)
# Verify no rounded corners appear
```

### Checking Spacing
```bash
# All spacing should be 8px multiples
# Use browser DevTools to measure
# 32, 40, 48, 80, 128 are common
```

### Typography Verification
```bash
# Check letter-spacing is correct
# Large text: negative tracking
# Small caps: positive tracking
# Body text: slight negative or default
```

---

**Keep this file handy for consistent implementation across all pages!**

