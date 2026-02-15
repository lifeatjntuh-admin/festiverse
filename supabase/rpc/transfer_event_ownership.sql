CREATE OR REPLACE FUNCTION transfer_event_ownership(
    target_event_id UUID,
    new_owner_id TEXT, -- Changed from UUID to TEXT
    new_role_for_old_owner TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_owner_id TEXT; -- Changed from UUID to TEXT
    executor_id TEXT; -- Changed from UUID to TEXT
    executor_roles TEXT[];
BEGIN
    -- Get Executor ID
    executor_id := auth.uid()::text; -- Cast to text
    
    -- Get Current Owner
    SELECT organizer_id INTO current_owner_id FROM events WHERE id = target_event_id;

    -- Get Executor Roles
    SELECT roles INTO executor_roles FROM profiles WHERE id = executor_id;

    -- 1. AUTH CHECK
    IF executor_id != current_owner_id 
       AND NOT ('super_admin' = ANY(executor_roles)) 
       AND NOT ('app_admin' = ANY(executor_roles)) THEN
        RAISE EXCEPTION 'Not authorized to transfer ownership of this event';
    END IF;

    -- 2. ROLE CHECK
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = new_owner_id 
        AND (
            'event_manager' = ANY(roles) OR 
            'super_admin' = ANY(roles) OR 
            'app_admin' = ANY(roles)
        )
    ) THEN
        RAISE EXCEPTION 'New owner does not have the required role (Event Manager/Admin)';
    END IF;

    -- 3. TRANSACTION START

    -- A. Update Event Owner
    UPDATE events SET organizer_id = new_owner_id WHERE id = target_event_id;

    -- B. Remove New Owner from Team
    DELETE FROM event_team_members WHERE event_id = target_event_id AND user_id = new_owner_id;

    -- C. Handle Old Owner
    DELETE FROM event_team_members WHERE event_id = target_event_id AND user_id = current_owner_id;

    IF new_role_for_old_owner IN ('co_host', 'member') THEN
        INSERT INTO event_team_members (event_id, user_id, role)
        VALUES (target_event_id, current_owner_id, new_role_for_old_owner::text);
    END IF;
    
END;
$$;
