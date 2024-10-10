<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Announcement;
use Application\models\Course;
use Application\models\Section;
use Application\models\User;

class AnnouncementControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Announcement::class;
    protected $TABLE_NAME = "announcements";
    protected $TABLE_PRIMARY_ID = "announcement_id";
    protected $SEARCH_LOOKUP = ["title"];

    public function add($data)
    {

        global $SESSION, $APPLICATION;

        $data['user_id'] = $SESSION->user_id;


        return $this->addRecord($data);
    }
}