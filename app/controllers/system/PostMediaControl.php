<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Post;
use Application\models\PostMedia;
use Application\models\Professor;
use Application\models\Staff;
use Application\models\User;

class PostMediaControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = PostMedia::class;
    protected $TABLE_NAME = "post_medias";
    protected $TABLE_PRIMARY_ID = "post_media_id";
    protected $SEARCH_LOOKUP = [];

    public function add($data)
    {
        return null;
    }

    public function update($id, $data)
    {
        return null;
    }
}