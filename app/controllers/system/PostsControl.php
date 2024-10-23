<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Post;
use Application\models\Professor;
use Application\models\Staff;
use Application\models\User;

class PostsControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Post::class;
    protected $TABLE_NAME = "posts";
    protected $TABLE_PRIMARY_ID = "post_id";
    protected $SEARCH_LOOKUP = [];

    public function add($data)
    {
        global $SESSION, $APPLICATION;

        $control = $APPLICATION->FUNCTIONS->POST_MEDIA_CONTROL;

        $data['user_id'] = $SESSION->user_id;

        if (isset($data['files'])) {
            $files = $data['files'];
            unset($data['files']);
        }

        $add = $this->addRecord($data);

        if (isset($files)) {
            if (is_array($files) && !empty($files)) {
                foreach ($files as $file) {
                    $control->addRecord([
                        "post_id" => $add->body['id'],
                        "filepath" => $file
                    ]);
                }
            }
        }

        return  $add;
    }

    public function update($id, $data)
    {
        return null;
    }
}