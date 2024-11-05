<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\Event;

class EventControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Event::class;
    protected $TABLE_NAME = "events";
    protected $TABLE_PRIMARY_ID = "event_id";
    protected $SEARCH_LOOKUP = ["title"];

    public function add($data)
    {
        global $SESSION;

        $data['user_id'] = $SESSION->user_id;

        return $this->addRecord($data);
    }
}