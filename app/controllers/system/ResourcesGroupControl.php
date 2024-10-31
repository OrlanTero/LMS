<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\ResourcesGroup;


class ResourcesGroupControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = ResourcesGroup::class;
    protected $TABLE_NAME = "resources_groups";
    protected $TABLE_PRIMARY_ID = "resources_group_id";
    protected $SEARCH_LOOKUP = ["title"];

    public function add($data)
    {
        return null;
    }

    public function edit($data)
    {
    }

    public function downloadResource($id) {
        global $APPLICATION;
        
        $control = $APPLICATION->FUNCTIONS->RESOURCES_CONTROL;

        $resource = $control->get($id, true);

        // Create temporary directory for files
        $temp_dir = sys_get_temp_dir() . '/resource_' . time();
        if (!file_exists($temp_dir)) {
            mkdir($temp_dir);
        }

        // Create folder for this resource using its title
        $resource_dir = $temp_dir . '/' . $resource->title;
        if (!file_exists($resource_dir)) {
            mkdir($resource_dir);
        }

        // Copy file to temp directory
        $source = $resource->file_path;
        $dest = $resource_dir . '/' . basename($resource->file_path);
        copy($source, $dest);

        // Create ZIP archive
        $zip_file = $temp_dir . '.zip';
        $zip = new \ZipArchive();
        $zip->open($zip_file, \ZipArchive::CREATE);

        // Add folder and file to ZIP
        $zip->addFile($dest, $resource->title . '/' . basename($resource->file_path));
        $zip->close();

        // Read zip file contents
        $zip_content = file_get_contents($zip_file);
        
        // Clean up temp files
        unlink($dest);
        rmdir($resource_dir);
        unlink($zip_file);
        rmdir($temp_dir);

        // Return base64 encoded zip content
        
        return [
            'code' => 200,
            'body' => base64_encode($zip_content)
        ];
    }

    public function downloadResourceGroup($id)
    {
        global $KLEIN;
        $group = $this->get($id, true);
        
        // Create temporary directory for files
        $temp_dir = sys_get_temp_dir() . '/resources_' . time();
        if (!file_exists($temp_dir)) {
            mkdir($temp_dir);
        }

        // Copy all resources to temp directory, organized in folders by title
        foreach ($group->resources as $resource) {
            // Create folder for this resource using its title
            $resource_dir = $temp_dir . '/' . $resource->title;
            if (!file_exists($resource_dir)) {
                mkdir($resource_dir);
            }

            $source = $resource->file_path;
            $dest = $resource_dir . '/' . basename($resource->file_path);
            copy($source, $dest);
        }

        // Create ZIP archive
        $zip_file = $temp_dir . '.zip';
        $zip = new \ZipArchive();
        $zip->open($zip_file, \ZipArchive::CREATE);

        // Add folders and files to ZIP
        $resource_folders = scandir($temp_dir);
        foreach ($resource_folders as $folder) {
            if ($folder != '.' && $folder != '..') {
                $folder_path = $temp_dir . '/' . $folder;
                if (is_dir($folder_path)) {
                    $files = scandir($folder_path);
                    foreach ($files as $file) {
                        if ($file != '.' && $file != '..') {
                            $zip->addFile($folder_path . '/' . $file, $folder . '/' . $file);
                        }
                    }
                }
            }
        }

        $zip->close();

        // Clean up temp directory
        foreach ($resource_folders as $folder) {
            if ($folder != '.' && $folder != '..') {
                $folder_path = $temp_dir . '/' . $folder;
                if (is_dir($folder_path)) {
                    array_map('unlink', glob("$folder_path/*.*"));
                    rmdir($folder_path);
                }
            }
        }
        rmdir($temp_dir);

        // Return zip file contents
        $zip_contents = file_get_contents($zip_file);
        unlink($zip_file);
        
        return [
            'code' => 200,
            'body' => base64_encode($zip_contents)
        ];
    }
}