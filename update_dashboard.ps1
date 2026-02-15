$file = "d:\Syeds Repo\festiverse\src\pages\admin\AdminDashboard.tsx"
$content = Get-Content $file -Raw

# 1. Add setEvents to destructuring
$content = $content -replace "refresh: refreshEvents } = useAllEvents\(\)", "refresh: refreshEvents, setEvents } = useAllEvents()"

# 2. Add setStalls to destructuring
$content = $content -replace "refresh: refreshStalls } = useStalls\(\)", "refresh: refreshStalls, setStalls } = useStalls()"

# 3. Add Optimistic Update logic
$optimisticUpdate = "toast.success('Ownership transferred successfully!')

            // Optimistic Update
            if (transferTarget.type === 'event' && newOwner) {
                setEvents((prev) => prev.map(e => 
                    e.id === transferTarget.id 
                    ? { ...e, organizer: newOwner, organizer_id: newOwner.id } 
                    : e
                ))
            } else if (transferTarget.type === 'stall' && newOwner) {
                setStalls((prev) => prev.map(s => 
                    s.id === transferTarget.id 
                    ? { ...s, owner: newOwner, owner_id: newOwner.id } 
                    : s
                ))
            }"

# We use simple string replacement for the block to avoid regex escaping issues with the block body
# But we need to be careful about the search string.
$searchString = "toast.success('Ownership transferred successfully!')"
if ($content.Contains($searchString)) {
    $content = $content.Replace($searchString, $optimisticUpdate)
    Set-Content -Path $file -Value $content
    Write-Host "Updates applied successfully."
} else {
    Write-Host "Error: Could not find target string for optimistic update block."
}
