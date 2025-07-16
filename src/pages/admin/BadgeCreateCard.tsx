import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const BADGE_PRESETS = [
  { name: "Honest Rookie", criteria_type: "xp_threshold", criteria_value: 50, description: "Earn 50 XP total" },
  { name: "Consistent Champ", criteria_type: "streak_paid_orders", criteria_value: 3, description: "3+ paid orders in a row" },
  { name: "Timely Titan", criteria_type: "early_payments", criteria_value: 5, description: "Paid within 30 mins, 5 times" },
  { name: "Order Marathoner", criteria_type: "orders_count", criteria_value: 10, description: "10 total paid orders" },
  { name: "High Roller", criteria_type: "amount_paid_total", criteria_value: 1000, description: "Spent over ₹1000" },
  { name: "Legend of the Dept", criteria_type: "top_rank_department", criteria_value: 1, description: "Top XP in department" },
  { name: "All Badge Collector", criteria_type: "badges_unlocked", criteria_value: 5, description: "Earned 5 different badges" },
  { name: "Profile Pro", criteria_type: "profile_fields_completed", criteria_value: 1, description: "Completed all profile fields" },
  { name: "Order Initiator", criteria_type: "order_count", criteria_value: 5, description: "Placed 5 orders" },
  { name: "Streak Sprinter", criteria_type: "streak_paid_orders", criteria_value: 3, description: "3 paid orders in a row" },
  { name: "Streak Master", criteria_type: "streak_paid_orders", criteria_value: 5, description: "5 paid orders in a row" },
  { name: "Timely Titan", criteria_type: "early_payments", criteria_value: 5, description: "Paid within 30 minutes 5 times" },
  { name: "High Roller", criteria_type: "amount_paid_total", criteria_value: 1000, description: "Spent over ₹1000 total" },
  { name: "XP Achiever", criteria_type: "xp_threshold", criteria_value: 100, description: "Earned 100 XP total" }
];

type BadgeForm = {
  name: string;
  description?: string;
  image_url?: string;
  criteria_type: string;
  criteria_value: string;
};

const badgeColors = [
  'from-pink-400 to-yellow-300',
  'from-blue-400 to-green-300',
  'from-purple-400 to-pink-300',
  'from-yellow-400 to-orange-300',
  'from-green-400 to-blue-300',
  'from-red-400 to-pink-300',
];
function getRandomColor() {
  return badgeColors[Math.floor(Math.random() * badgeColors.length)];
}

export function BadgeCreateCard() {
  const { register, handleSubmit, reset } = useForm<BadgeForm>();
  const [color, setColor] = useState(getRandomColor());
  const [loading, setLoading] = useState(false);
  // Get unique criteria types from BADGE_PRESETS
  const criteriaTypes = Array.from(new Set(BADGE_PRESETS.map(b => b.criteria_type)));
  const onSubmit = async (values: BadgeForm) => {
    setLoading(true);
    await supabase.from('badges').insert({
      name: values.name,
      description: values.description,
      image_url: values.image_url,
      condition: { type: values.criteria_type, value: values.criteria_value },
      created_at: new Date().toISOString(),
      is_active: true,
      min_points: 0 // or set as needed
    });
    reset();
    setColor(getRandomColor());
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`rounded-xl p-6 shadow-lg bg-gradient-to-r ${color} text-white mb-6`}>
      <div className="flex items-center gap-3 mb-2">
        <input {...register('image_url')} placeholder="Badge Image URL or Emoji" className="rounded px-2 py-1 text-black" />
        <input {...register('name', { required: true })} placeholder="Badge Title" className="rounded px-2 py-1 text-black" />
      </div>
      <textarea {...register('description')} placeholder="Description" className="rounded px-2 py-1 w-full text-black mb-2" />
      <div className="flex gap-2 mb-2">
        <select {...register('criteria_type', { required: true })} className="rounded px-2 py-1 text-black">
          <option value="">Select Criteria Type</option>
          {criteriaTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input {...register('criteria_value', { required: true })} placeholder="Value" className="rounded px-2 py-1 text-black" />
      </div>
      <Button type="submit" disabled={loading}>Create Badge</Button>
    </form>
  );
} 