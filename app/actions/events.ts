'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface CreateEventData {
  name: string;
  description?: string;
  image_url?: string;
  visibility: 'public' | 'private';
  start_datetime: string; // ISO string
  end_datetime: string; // ISO string
  timezone: string;
}

export async function createEvent(data: CreateEventData) {
  try {
    // Get the authenticated user from Clerk
    const { userId, orgId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be signed in to create an event',
      };
    }

    if (!orgId) {
      return {
        success: false,
        error: 'You must be part of an organization to create an event',
      };
    }

    // Validate required fields
    if (!data.name || !data.start_datetime || !data.end_datetime || !data.timezone) {
      return {
        success: false,
        error: 'Missing required fields',
      };
    }

    // Validate datetime range
    const startDate = new Date(data.start_datetime);
    const endDate = new Date(data.end_datetime);

    if (endDate <= startDate) {
      return {
        success: false,
        error: 'End date must be after start date',
      };
    }

    // Insert the event into Supabase
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        name: data.name,
        description: data.description || null,
        image_url: data.image_url || null,
        visibility: data.visibility,
        start_datetime: data.start_datetime,
        end_datetime: data.end_datetime,
        timezone: data.timezone,
        created_by: userId,
        organization_id: orgId,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        success: false,
        error: 'Failed to create event',
      };
    }

    // Revalidate the events page
    revalidatePath('/events');

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function getEvents() {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be signed in to view events',
      };
    }

    if (!orgId) {
      return {
        success: false,
        error: 'You must be part of an organization to view events',
      };
    }

    // Fetch events for the organization
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('organization_id', orgId)
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return {
        success: false,
        error: 'Failed to fetch events',
      };
    }

    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function uploadEventImage(formData: FormData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be signed in to upload images',
      };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('events')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage error:', error);
      return {
        success: false,
        error: 'Failed to upload image',
      };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('events')
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
      },
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
