<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>app.turlepod.xyz</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6; /* Light gray background */
        }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-4 rounded-md">app.turlepod.xyz</h1>
        <p class="text-lg text-gray-600 mb-8">Select an application to explore:</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <?php
            // Get all directories in the current folder (public_html)
            $directories = array_filter(glob('*'), 'is_dir');

            // Filter out special directories and the index.php file
            $app_directories = [];
            foreach ($directories as $dir) {
                if ($dir !== '.' && $dir !== '..') {
                    $app_directories[] = $dir;
                }
            }

            // If there are no app directories found, display a message
            if (empty($app_directories)) {
                echo '<p class="text-gray-500 col-span-full">No applications found yet. Create subdirectories to list your apps!</p>';
            } else {
                // Sort directories alphabetically
                sort($app_directories);

                // Loop through each directory and create a link
                foreach ($app_directories as $dir) {
                    $displayName = ucwords(str_replace(['-', '_'], ' ', $dir)); // Make it look nicer
                    echo '<a href="./' . htmlspecialchars($dir) . '/" ';
                    echo 'class="block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1">';
                    echo '<span class="text-xl">' . htmlspecialchars($displayName) . '</span>';
                    echo '</a>';
                }
            }
            ?>
        </div>
    </div>
</body>
</html>
