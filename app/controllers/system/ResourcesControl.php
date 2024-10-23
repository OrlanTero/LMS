<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\Resources;


class ResourcesControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Resources::class;
    protected $TABLE_NAME = "resources";
    protected $TABLE_PRIMARY_ID = "resources_id";
    protected $SEARCH_LOOKUP = ["title"];

    public function add($data)
    {   

        global $APPLICATION;

        $groupControl = $APPLICATION->FUNCTIONS->RESOURCES_GROUP_CONTROL;

        $file = $_FILES['file'];

        $main_ref = null;

        if (isset($data['group_id'])) {
            if (is_array($data['group_id'])) {
                $main_ref = GenerateRandomReferenceNumber(8, 'GRP'); 
    
                $data['group_id']['ref'] = $main_ref;
                $data['group_id']['section_id'] = $data['section_id'];
                $data['group_id']['section_subject_id'] = $data['section_subject_id'];

                $group = $groupControl->addRecord($data['group_id']);
    
                if ($group->code == 200) {
                    $data['group_id'] = $group->body['id'];
                }
            } else {
                $group = $groupControl->get($data['group_id'], true);
    
                $main_ref = $group->ref;
            }
        } else {
            $main_ref = GenerateRandomReferenceNumber(8, 'GRP'); 
        }

        $response = UploadFileFromFile($file, "public/assets/media/resources/" . $main_ref . "/");

        if ($response->code == 200) {
            $mainData = [
                "resources_group_id" => $data['group_id'],
                "section_id" => $data['section_id'],
                "section_subject_id" => $data['section_subject_id'],
                "ref" => $main_ref,
                "title" => $data['title'],
                "description" => $data['description'],
                "file_name" => $file['name'],
                "file_size" => $file['size'],
                "file_type" => pathinfo($file['name'], PATHINFO_EXTENSION),
                "file_path" => $response->body['path'],
            ];
    
    
            return $this->addRecord($mainData);
        }

        return $response;
    }

    public function edit($data)
    {
    }
}