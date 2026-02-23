import { FileText, ImageIcon, Video, Headphones, BarChart3, Presentation, Palette, Smartphone, BookMarked, Star } from 'lucide-react';

export const designTypes = [
  {
    label: "Document",
    bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
    icon: <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Social Media",
    bgColor: "bg-gradient-to-br from-pink-400 to-rose-600",
    icon: <ImageIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Video",
    bgColor: "bg-gradient-to-br from-red-400 to-red-600",
    icon: <Video className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Podcast",
    bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
    icon: <Headphones className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Chart",
    bgColor: "bg-gradient-to-br from-emerald-400 to-green-600",
    icon: <BarChart3 className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Presentation",
    bgColor: "bg-gradient-to-br from-amber-400 to-orange-600",
    icon: <Presentation className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Design",
    bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    icon: <Palette className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Mobile App",
    bgColor: "bg-gradient-to-br from-cyan-400 to-blue-600",
    icon: <Smartphone className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Book",
    bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    icon: <BookMarked className="w-7 h-7 text-white" strokeWidth={2.5} />
  },
  {
    label: "Other",
    bgColor: "bg-gradient-to-br from-slate-400 to-slate-600",
    icon: <Star className="w-7 h-7 text-white" strokeWidth={2.5} />
  }
];

export const textPresets = [
  {
    name: 'Heading',
    text: 'Add a Heading',
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Inter, sans-serid'
  },
  {
    name: 'Sub Heading',
    text: 'Add a Sub Heading',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter, sans-serid'
  },
  {
    name: 'Body Text',
    text: 'Add a little bit of body text',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Inter, sans-serid'
  },
  {
    name: 'Caption',
    text: 'Add a caption',
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: 'Inter, sans-serid',
    fontStyle: 'normal'
  }
]