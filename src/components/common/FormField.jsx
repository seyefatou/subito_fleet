import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  className,
  disabled = false,
  rows = 3
}) {
  const id = `field-${name}`;

  const handleChange = (val) => {
    onChange({ target: { name, value: val } });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {type === "select" ? (
        <Select 
          value={value || ''} 
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder={placeholder || `Sélectionner ${label?.toLowerCase() || ''}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "textarea" ? (
        <Textarea
          id={id}
          name={name}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className="bg-slate-50 border-slate-200 resize-none"
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="bg-slate-50 border-slate-200"
        />
      )}
    </div>
  );
}