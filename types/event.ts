export interface Event {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  visibility: 'public' | 'private';
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  name: string;
  description?: string;
  image?: File;
  visibility: 'public' | 'private';
  start_datetime: Date;
  end_datetime: Date;
  timezone: string;
}
