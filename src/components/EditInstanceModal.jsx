'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { updateInstance } from '@/lib/api';
import { toast } from "sonner";

export default function EditInstanceModal({ instance, isOpen, onClose, onUpdate, token }) {
    const [formData, setFormData] = useState({
        customTitle: '',
        notes: '',
        customReminders: [],
        deadline: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (instance) {
            setFormData({
                customTitle: instance.customTitle || '',
                notes: instance.notes || '',
                customReminders: instance.customReminders || [],
                deadline: instance.deadline ? new Date(instance.deadline).toISOString().split('T')[0] : ''
            });
        }
    }, [instance]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            const result = await updateInstance(instance._id, formData, token);
            toast.success('Instance updated successfully');
            onUpdate(result.instance);
            onClose();
        } catch (error) {
            console.error('Error updating instance:', error);
            toast.error('Failed to update instance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Edit Instance</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Custom Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.customTitle}
                            onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                            placeholder={instance.studyPlanId?.title || 'My Study Session'}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Deadline (Optional)
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add personal notes, goals, or reminders..."
                            rows={4}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-border">
                        <label className="block text-sm font-medium text-foreground mb-3">
                            Custom Reminders
                        </label>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {formData.customReminders?.map((reminder, index) => (
                                    <div
                                        key={index}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                                    >
                                        <span>
                                            {reminder.value} {reminder.unit} before
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newReminders = formData.customReminders.filter((_, i) => i !== index);
                                                setFormData({ ...formData, customReminders: newReminders });
                                            }}
                                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 items-end">
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        id="modalReminderValue"
                                        className="w-20 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <select
                                        id="modalReminderUnit"
                                        className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const valueInput = document.getElementById("modalReminderValue");
                                        const unitInput = document.getElementById("modalReminderUnit");
                                        const value = parseInt(valueInput.value);
                                        const unit = unitInput.value;

                                        if (value > 0) {
                                            const newReminder = {
                                                id: `${Date.now()}`,
                                                value,
                                                unit,
                                                type: 'before_deadline'
                                            };
                                            setFormData({
                                                ...formData,
                                                customReminders: [...(formData.customReminders || []), newReminder]
                                            });
                                            valueInput.value = "";
                                        }
                                    }}
                                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
