<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\PostComment;
use Application\controllers\app\Response;


class PostCommentControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = PostComment::class;
    protected $TABLE_NAME = "post_comments";
    protected $TABLE_PRIMARY_ID = "post_comment_id";
    protected $SEARCH_LOOKUP = ["post_id", "user_id", "comment"];

    public function add($data)
    {
        global $SESSION;

        $data['user_id'] = $SESSION->user_id;

        $this->addRecord($data);
    }
}