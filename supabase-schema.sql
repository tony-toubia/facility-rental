-- Facility Rental Platform Database Schema for Supabase
-- This schema supports user management, facility listings, bookings, reviews, and more

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_type AS ENUM ('renter', 'owner', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE price_unit AS ENUM ('hour', 'day', 'session');
CREATE TYPE facility_status AS ENUM ('active', 'inactive', 'pending_approval', 'suspended');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    user_type user_type NOT NULL DEFAULT 'renter',
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_bookings INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT, -- For storing Lucide icon names
    color TEXT, -- CSS color class or hex
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facilities table
CREATE TABLE public.facilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id TEXT REFERENCES public.categories(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Gym & Fitness, Swimming Pool, etc.
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for spatial queries
    price DECIMAL(10, 2) NOT NULL,
    price_unit price_unit NOT NULL DEFAULT 'hour',
    capacity INTEGER,
    min_booking_duration INTEGER DEFAULT 1, -- in hours
    max_booking_duration INTEGER DEFAULT 8, -- in hours
    advance_booking_days INTEGER DEFAULT 30, -- how far in advance bookings can be made
    cancellation_policy TEXT,
    house_rules TEXT,
    status facility_status DEFAULT 'pending_approval',
    is_featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facility images table
CREATE TABLE public.facility_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facility amenities table
CREATE TABLE public.facility_amenities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon_name TEXT, -- For storing Lucide icon names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facility features table
CREATE TABLE public.facility_features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facility availability table (for recurring availability patterns)
CREATE TABLE public.facility_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id, day_of_week, start_time, end_time)
);

-- Facility blocked dates (for specific dates when facility is not available)
CREATE TABLE public.facility_blocked_dates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    blocked_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id, blocked_date, start_time, end_time)
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE, -- verified if user actually booked the facility
    owner_response TEXT,
    owner_response_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, facility_id, booking_id) -- One review per booking
);

-- Favorites table (for users to save facilities)
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, facility_id)
);

-- Messages table (for communication between users and facility owners)
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- booking_confirmed, booking_cancelled, new_review, etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data related to the notification
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    facility_owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    owner_payout DECIMAL(10, 2) NOT NULL,
    payment_method TEXT, -- stripe, paypal, etc.
    payment_intent_id TEXT, -- Stripe payment intent ID
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_facilities_owner_id ON public.facilities(owner_id);
CREATE INDEX idx_facilities_category_id ON public.facilities(category_id);
CREATE INDEX idx_facilities_location ON public.facilities USING GIST(location);
CREATE INDEX idx_facilities_status ON public.facilities(status);
CREATE INDEX idx_facilities_rating ON public.facilities(rating DESC);
CREATE INDEX idx_facilities_created_at ON public.facilities(created_at DESC);

CREATE INDEX idx_bookings_facility_id ON public.bookings(facility_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

CREATE INDEX idx_reviews_facility_id ON public.reviews(facility_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

CREATE INDEX idx_facility_images_facility_id ON public.facility_images(facility_id);
CREATE INDEX idx_facility_amenities_facility_id ON public.facility_amenities(facility_id);
CREATE INDEX idx_facility_features_facility_id ON public.facility_features(facility_id);

CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facility_availability_updated_at BEFORE UPDATE ON public.facility_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update facility rating when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_facility_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.facilities 
    SET 
        rating = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM public.reviews 
            WHERE facility_id = COALESCE(NEW.facility_id, OLD.facility_id)
        ), 0),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews 
            WHERE facility_id = COALESCE(NEW.facility_id, OLD.facility_id)
        )
    WHERE id = COALESCE(NEW.facility_id, OLD.facility_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for updating facility ratings
CREATE TRIGGER update_facility_rating_on_review_insert 
    AFTER INSERT ON public.reviews 
    FOR EACH ROW EXECUTE FUNCTION update_facility_rating();

CREATE TRIGGER update_facility_rating_on_review_update 
    AFTER UPDATE ON public.reviews 
    FOR EACH ROW EXECUTE FUNCTION update_facility_rating();

CREATE TRIGGER update_facility_rating_on_review_delete 
    AFTER DELETE ON public.reviews 
    FOR EACH ROW EXECUTE FUNCTION update_facility_rating();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total bookings for renter
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.users 
        SET total_bookings = (
            SELECT COUNT(*) 
            FROM public.bookings 
            WHERE user_id = NEW.user_id AND status = 'completed'
        )
        WHERE id = NEW.user_id;
    END IF;
    
    -- Update total listings for owner
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.users 
        SET total_listings = (
            SELECT COUNT(*) 
            FROM public.facilities 
            WHERE owner_id = (SELECT owner_id FROM public.facilities WHERE id = NEW.facility_id)
              AND status = 'active'
        )
        WHERE id = (SELECT owner_id FROM public.facilities WHERE id = NEW.facility_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for updating user stats
CREATE TRIGGER update_user_stats_on_booking 
    AFTER INSERT OR UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and update their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Facilities are publicly readable, but only owners can modify their own
CREATE POLICY "Facilities are publicly readable" ON public.facilities FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can manage their facilities" ON public.facilities FOR ALL USING (auth.uid() = owner_id);

-- Facility images, amenities, and features follow facility permissions
CREATE POLICY "Facility images are publicly readable" ON public.facility_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND status = 'active')
);
CREATE POLICY "Owners can manage facility images" ON public.facility_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND owner_id = auth.uid())
);

CREATE POLICY "Facility amenities are publicly readable" ON public.facility_amenities FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND status = 'active')
);
CREATE POLICY "Owners can manage facility amenities" ON public.facility_amenities FOR ALL USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND owner_id = auth.uid())
);

CREATE POLICY "Facility features are publicly readable" ON public.facility_features FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND status = 'active')
);
CREATE POLICY "Owners can manage facility features" ON public.facility_features FOR ALL USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND owner_id = auth.uid())
);

-- Availability and blocked dates
CREATE POLICY "Facility availability is publicly readable" ON public.facility_availability FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND status = 'active')
);
CREATE POLICY "Owners can manage facility availability" ON public.facility_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND owner_id = auth.uid())
);

CREATE POLICY "Facility blocked dates are publicly readable" ON public.facility_blocked_dates FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND status = 'active')
);
CREATE POLICY "Owners can manage blocked dates" ON public.facility_blocked_dates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.facilities WHERE id = facility_id AND owner_id = auth.uid())
);

-- Bookings can be viewed by the user who made them or the facility owner
CREATE POLICY "Users can view their bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT owner_id FROM public.facilities WHERE id = facility_id)
);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and owners can update bookings" ON public.bookings FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT owner_id FROM public.facilities WHERE id = facility_id)
);

-- Reviews are publicly readable, but only the reviewer can modify their own
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Facility owners can respond to reviews" ON public.reviews FOR UPDATE USING (
    auth.uid() = (SELECT owner_id FROM public.facilities WHERE id = facility_id)
);

-- Favorites are private to each user
CREATE POLICY "Users can manage their favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Messages can be viewed by sender or recipient
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications are private to each user
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Transactions can be viewed by the user or facility owner involved
CREATE POLICY "Users can view their transactions" ON public.transactions FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = facility_owner_id
);

-- Categories are publicly readable
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY; -- Categories are public

-- Insert default categories
INSERT INTO public.categories (id, name, description, icon_name, color) VALUES
('gyms', 'Gyms & Fitness', 'Fully equipped gyms and fitness centers', 'Dumbbell', 'bg-red-500'),
('pools', 'Swimming Pools', 'Indoor and outdoor swimming pools', 'Waves', 'bg-blue-500'),
('courts', 'Sports Courts', 'Basketball, tennis, volleyball courts', 'Trophy', 'bg-green-500'),
('fields', 'Sports Fields', 'Soccer, football, baseball fields', 'Target', 'bg-yellow-500'),
('studios', 'Dance Studios', 'Dance and yoga studios', 'Zap', 'bg-purple-500'),
('events', 'Event Spaces', 'Multi-purpose event and meeting spaces', 'Users', 'bg-indigo-500');

-- Create a function to handle user creation (to be called from a trigger or API)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger to automatically create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();